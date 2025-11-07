# Payment Flow Implementation

## Overview

This document describes the token-validated payment flow using Razorpay integration.

## Flow Steps

1. **Token Generation** (server-side)

   - Admin/system generates payment token: `generatePaymentToken(firebase_uid, amount, expiresInMs)`
   - Token format: base64url({ firebase_uid, amount, expiresAt, signature })
   - Token is sent to user via email/SMS with link: `/pay?token=XXX`

2. **Payment Page** (`/pay`)

   - User opens payment link
   - Client validates token via `POST /api/payments/validate-token`
   - Shows error if token is invalid/expired/used
   - Shows payment UI with amount if valid

3. **Create Order**

   - User clicks "Pay Now"
   - Client calls `POST /api/payments/razorpay/create-order` with `{ token }`
   - Server validates token again
   - Creates Razorpay order and returns `{ keyId, orderId, amount }`

4. **Razorpay Checkout**

   - Client opens Razorpay checkout modal with orderId
   - User completes payment (UPI/card/netbanking/wallet)
   - Razorpay returns `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`

5. **Verify Payment** (client callback)

   - Client calls `POST /api/payments/razorpay/verify` with Razorpay response
   - Server verifies signature using RAZORPAY_KEY_SECRET
   - Updates `users.application.payments[]` and `users.application.purchases[]`
   - Updates `users.final_fee_payment.payment_status = 'paid'`
   - Appends payment to `users.final_fee_payment.payment_history[]`
   - Sets `users.account_type = 'premium'`
   - Returns `{ ok: true, redirectToken }` (short-lived, 5 min)

6. **Webhook** (async, source of truth)

   - Razorpay sends webhook to `POST /api/payments/razorpay/webhook`
   - Server verifies signature with RAZORPAY_WEBHOOK_SECRET
   - Idempotency check: skip if payment already in payment_history
   - Updates `final_fee_payment.payment_status` based on event (payment.captured → "paid")
   - Appends webhook event to payment_history

7. **Redirect to Premium**
   - Client receives redirectToken from verify endpoint
   - Redirects to `/premium?token=XXX`
   - Premium page shows success message and links to dashboard

## API Endpoints

### POST /api/payments/validate-token

Validates payment token from URL.

**Request:**

```json
{ "token": "base64url_encoded_token" }
```

**Response (valid):**

```json
{
  "valid": true,
  "firebase_uid": "abc123",
  "amount": 5000,
  "expiresAt": 1234567890000
}
```

**Response (invalid):**

```json
{
  "valid": false,
  "error": "expired" | "invalid_signature" | "malformed" | "used",
  "hint": "Optional error details",
  "usedAt": "2024-01-01T00:00:00.000Z" // if error === "used"
}
```

### POST /api/payments/razorpay/create-order

Creates Razorpay order. Supports two flows:

1. Token-based (from /pay): `{ token }`
2. Direct with auth: `{ amount }` + Authorization header

**Request (token-based):**

```json
{ "token": "base64url_encoded_token" }
```

**Request (direct):**

```json
{
  "amount": 5000,
  "currency": "INR",
  "receipt": "rcpt_12345",
  "notes": { "app": "neram" }
}
```

Headers: `Authorization: Bearer <Firebase_ID_token>`

**Response:**

```json
{
  "keyId": "rzp_live_xxx",
  "orderId": "order_xxx",
  "amount": 500000,
  "currency": "INR",
  "status": "created"
}
```

### POST /api/payments/razorpay/verify

Verifies Razorpay payment signature and updates DB.

**Request:**

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "amount": 5000,
  "currency": "INR",
  "course": "jee-2025"
}
```

Headers: `Authorization: Bearer <Firebase_ID_token>` (optional in dev if ALLOW_UNAUTH_RAZORPAY=true)

**Response:**

```json
{
  "ok": true,
  "redirectToken": "base64url_encoded_token"
}
```

### POST /api/payments/razorpay/webhook

Razorpay webhook handler (async, idempotent).

**Headers:**

- `x-razorpay-signature`: HMAC signature

**Payload:**

```json
{
  "event": "payment.captured" | "payment.failed" | "payment_link.paid" | ...,
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxx",
        "order_id": "order_xxx",
        "amount": 500000,
        "currency": "INR",
        "status": "captured",
        "method": "upi",
        "notes": { "uid": "firebase_uid_123" }
      }
    }
  }
}
```

**Response:**

```json
{ "ok": true }
```

## Database Schema

### users.application (JSONB)

```typescript
{
  payments: [
    {
      provider: "razorpay",
      orderId: "order_xxx",
      paymentId: "pay_xxx",
      signature: "sig_xxx",
      amount: 5000,
      currency: "INR",
      status: "verified",
      course: "jee-2025",
      ts: "2024-01-01T00:00:00.000Z"
    }
  ],
  purchases: [
    {
      course: "jee-2025",
      paymentId: "pay_xxx",
      orderId: "order_xxx",
      amount: 5000,
      granted_at: "2024-01-01T00:00:00.000Z",
      provider: "razorpay"
    }
  ],
  invoices: [
    {
      paymentId: "pay_xxx",
      orderId: "order_xxx",
      amount: 5000,
      currency: "INR",
      course: "jee-2025",
      created_at: "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### users.final_fee_payment (JSONB)

```typescript
{
  payment_status: "paid" | "pending" | "failed" | "partial",
  payment_method: "upi" | "card" | "netbanking" | "wallet",
  payment_history: [
    {
      event: "payment.captured",
      paymentId: "pay_xxx",
      orderId: "order_xxx",
      amount: 5000,
      method: "upi",
      status: "captured",
      currency: "INR",
      ts: "2024-01-01T00:00:00.000Z",
      source: "webhook" | "verify"
    }
  ],
  last_webhook_at: "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables

Required for payment flow:

```bash
# Razorpay credentials
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# Token signing (reuse session secret)
PAYMENT_TOKEN_SECRET=xxx
SESSION_SECRET=xxx

# Base URL for internal API calls
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Dev mode (skip auth in create-order/verify)
ALLOW_UNAUTH_RAZORPAY=false
```

## Security Notes

1. **Token Signature**: Payment tokens are signed with HMAC SHA256 using PAYMENT_TOKEN_SECRET
2. **Expiry**: Tokens expire after 24 hours by default (configurable)
3. **Idempotency**: Webhook checks payment_history to avoid duplicate processing
4. **Signature Verification**:
   - create-order validates token signature before creating order
   - verify validates Razorpay signature before updating DB
   - webhook validates Razorpay signature before processing
5. **Redirect Token**: Short-lived (5 min) token for post-payment redirect, not security-critical

## Token Generation Example

```typescript
// In an API route or admin script
import { generatePaymentToken } from "@/lib/paymentTokens";

const token = generatePaymentToken(
  "firebase_uid_123",
  5000,
  24 * 60 * 60 * 1000
);
const paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pay?token=${token}`;

// Send paymentUrl via email/SMS to user
await sendEmail({
  to: user.email,
  subject: "Complete Your Payment",
  body: `Click here to pay: ${paymentUrl}`,
});
```

## Testing Flow

1. Generate test token:

   ```typescript
   const token = generatePaymentToken("test_uid", 100); // ₹100, 24h expiry
   ```

2. Open payment page:

   ```
   http://localhost:3000/pay?token=<generated_token>
   ```

3. Click "Pay Now" and complete test payment in Razorpay test mode

4. Verify DB updates:

   - `application.payments[]` has new entry
   - `final_fee_payment.payment_status = 'paid'`
   - `final_fee_payment.payment_history[]` has verify entry
   - After webhook: `payment_history[]` has webhook entry

5. Check redirect to `/premium?token=XXX`

## Webhook Setup

Configure in Razorpay Dashboard:

- URL: `https://yourdomain.com/api/payments/razorpay/webhook`
- Events: `payment.captured`, `payment.failed`, `payment_link.paid`, `payment_link.failed`
- Secret: Set RAZORPAY_WEBHOOK_SECRET env var

## Error Handling

- **Invalid token**: Show error message with "Request New Payment Link" button
- **Expired token**: Same as invalid
- **Used token**: Show when it was used
- **Payment failed**: Webhook updates `payment_status = 'failed'`, user can retry with new token
- **Signature mismatch**: 401 error, log for investigation
- **Network errors**: Client retries automatically (Razorpay handles retry logic)

## Future Improvements

1. Store tokens in DB for stricter validation (mark as used after order creation)
2. Add payment link generation UI for admins
3. Email payment receipts/invoices automatically
4. Support partial payments and payment plans
5. Add payment analytics dashboard
6. Support refunds via Razorpay API
