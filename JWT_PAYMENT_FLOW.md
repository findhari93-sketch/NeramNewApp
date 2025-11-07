# JWT Payment Token Flow - Setup Guide

## Overview

The payment flow now supports JWT tokens from the admin application. The admin app generates signed JWT tokens containing payment details (userId, amount, type) and sends them via email as payment links.

## Architecture

### Flow Diagram

```
Admin App → Generate JWT Token → Email Payment Link
  ↓
Student clicks link: /pay?v=<JWT>&type=razorpay
  ↓
/pay page validates JWT client-side → Shows payment UI
  ↓
User clicks "Pay Now" → Calls /api/payments/razorpay/create-order
  ↓
create-order validates JWT → Creates Razorpay order → Saves order_id to DB
  ↓
Razorpay checkout opens → User completes payment
  ↓
On success → Calls /api/payments/razorpay/verify
  ↓
verify validates signature → Updates DB (payment_status=paid, token_used=true)
  ↓
Redirects to /premium?token=<redirect_token>
```

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Payment Token Secret (use same secret in both admin and student apps)
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
PAYMENT_TOKEN_SECRET=your-secret-key-here

# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Next.js Public Variables (for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Files Created/Modified

### 1. JWT Validation Utility

**File**: `src/lib/validatePaymentToken.ts`

Validates JWT payment tokens with:

- Signature verification using `PAYMENT_TOKEN_SECRET`
- Expiry check
- Required claims validation (userId, amount, type)
- Error handling for expired/invalid tokens

### 2. Payment Page (Updated)

**File**: `src/app/(main)/pay/page.tsx`

Changes:

- Now accepts `v` query parameter (JWT token) in addition to legacy `token`
- Validates JWT client-side before showing payment UI
- Shows appropriate error messages for expired/invalid tokens
- Passes JWT to create-order endpoint for server-side validation
- Displays payment amount from decoded JWT

### 3. Create Order Endpoint (Updated)

**File**: `src/app/api/payments/razorpay/create-order/route.ts`

Changes:

- Added JWT token validation flow (priority over DB token)
- Validates JWT signature and extracts userId/amount
- Optional DB check to prevent duplicate payments
- Creates Razorpay order with amount from JWT
- Saves razorpay_order_id to DB for webhook mapping

### 4. Verify Payment Endpoint (Recreated)

**File**: `src/app/api/payments/razorpay/verify/route.ts`

Features:

- Verifies Razorpay signature
- Finds application by razorpay_order_id or userId from JWT
- Idempotency check (prevents duplicate processing)
- Updates DB: `token_used=true`, `payment_status='paid'`
- Generates redirect token for /premium page

## JWT Token Structure

The admin app generates tokens with this payload:

```typescript
{
  userId: string,      // Application ID (UUID)
  amount: number,      // Payment amount in rupees
  type: string,        // Payment type: "direct" | "razorpay" | "full" | "partial"
  iat: number,         // Issued at (Unix timestamp)
  exp: number          // Expires at (Unix timestamp, default: 7 days from iat)
}
```

## Testing the Flow

### 1. Set Up Environment

```bash
# Add PAYMENT_TOKEN_SECRET to .env.local
echo "PAYMENT_TOKEN_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env.local

# Restart dev server
npm run dev
```

### 2. Get a Test Payment Link from Admin App

The admin app should generate a payment link like:

```
http://localhost:3001/pay?v=eyJhbGci...&type=razorpay
```

### 3. Test the Payment Flow

1. Open the payment link in browser
2. Should see "Complete Your Payment" page with amount
3. Click "Pay Now" → Razorpay checkout should open
4. Use Razorpay test card: `4111 1111 1111 1111`, any future date, any CVV
5. After successful payment, should redirect to /premium

### 4. Verify in Database

Check `users_duplicate` table, `application_details.final_fee_payment`:

```sql
SELECT
  id,
  application_details->'final_fee_payment'->>'token_used' as token_used,
  application_details->'final_fee_payment'->>'payment_status' as payment_status,
  application_details->'final_fee_payment'->>'razorpay_payment_id' as payment_id,
  application_details->'final_fee_payment'->'payment_history' as history
FROM users_duplicate
WHERE id = '<application-id>';
```

Should show:

- `token_used`: `true`
- `payment_status`: `paid`
- `razorpay_payment_id`: `pay_xxxxx`
- `payment_history`: Array with verification event

## Error Handling

### Client-Side Errors (Pay Page)

- **Token Expired**: "This payment link has expired. Please request a new payment link."
- **Invalid Token**: "Invalid payment link. Please contact support."
- **Missing Secret**: "Payment system configuration error. Please contact support."

### Server-Side Errors (API)

- **token_expired**: Token JWT expiry check failed
- **invalid_signature**: Razorpay signature verification failed
- **already_paid**: Payment already completed for this application
- **token_used**: Payment link already used
- **application_not_found**: Could not find application for payment

## Security Considerations

1. **Secret Management**

   - Use the same `PAYMENT_TOKEN_SECRET` in both admin and student apps
   - Keep it secret, never commit to git
   - Rotate periodically (will invalidate existing tokens)

2. **Token Expiry**

   - Admin app sets expiry (default: 7 days)
   - Student app validates expiry during payment
   - Expired tokens show user-friendly error

3. **Idempotency**
   - Verify endpoint checks `payment_history` array
   - Prevents duplicate processing if user clicks multiple times
   - Webhook (not yet updated) should also check idempotency

## Backwards Compatibility

The system still supports the old DB token flow:

- `/pay?token=<db-token>` (legacy format)
- Automatically falls back to DB lookup if `v` parameter not present
- Both flows can coexist

## Next Steps

1. **Add PAYMENT_TOKEN_SECRET to environment**

   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Test with real payment link from admin app**

   - Approve an application in admin app
   - Check email for payment link
   - Click link and test payment flow

3. **Update webhook handler** (optional, for async payment confirmation)

   - File: `src/app/api/payments/razorpay/webhook/route.ts`
   - Add JWT token support if needed

4. **Add admin endpoint to regenerate tokens**
   - POST /api/admin/regenerate-payment-token
   - Accept applicationId
   - Generate new JWT and update DB

## Troubleshooting

### "Invalid payment link" error

- Check if `PAYMENT_TOKEN_SECRET` matches between admin and student apps
- Verify JWT is not expired (check payload.exp)
- Ensure token is properly URL-encoded in email link

### "Payment system configuration error"

- `PAYMENT_TOKEN_SECRET` not set in .env.local
- Restart dev server after adding env variable

### Payment not reflecting in database

- Check verify endpoint logs in terminal
- Verify Razorpay webhook secret is correct
- Check `payment_history` array in `application_details.final_fee_payment`

### Razorpay checkout not opening

- Check browser console for errors
- Verify Razorpay script is loaded (should see in Network tab)
- Ensure `RAZORPAY_KEY_ID` is correct

## Contact

For issues or questions, check:

1. Terminal logs (search for `[verify]`, `[create-order]`)
2. Browser console errors
3. Supabase logs for database errors
