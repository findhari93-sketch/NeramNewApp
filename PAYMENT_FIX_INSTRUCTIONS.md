# Payment Database Fix Instructions

## Problem
Payment details are not being stored in the database after successful Razorpay payment completion.

## Root Cause
The `users_duplicate` table is missing the `application_details` JSONB column that stores payment information. The payment code expects:
```
users_duplicate.application_details.final_fee_payment
```

But your table structure might have `final_fee_payment` as a top-level column or the `application_details` column is missing entirely.

## Solution

### Step 1: Check Your Current Table Structure

Run this query in Supabase SQL Editor:

```sql
-- Check what columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users_duplicate'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Step 2: Add Missing Column (if needed)

If `application_details` column doesn't exist, run this migration:

```sql
-- Add application_details column
ALTER TABLE public.users_duplicate
ADD COLUMN IF NOT EXISTS application_details JSONB DEFAULT '{}'::jsonb;
```

### Step 3: Migrate Existing Data (if applicable)

If you have `final_fee_payment` as a top-level column, migrate it:

```sql
-- Move data from top-level final_fee_payment to application_details.final_fee_payment
UPDATE public.users_duplicate
SET application_details = jsonb_set(
  COALESCE(application_details, '{}'::jsonb),
  '{final_fee_payment}',
  COALESCE(final_fee_payment, '{}'::jsonb)
)
WHERE final_fee_payment IS NOT NULL
  AND final_fee_payment::text != '{}'::text;
```

### Step 4: Verify the Structure

```sql
-- Check that data is accessible
SELECT
  id,
  application_details->'final_fee_payment'->>'payment_status' as payment_status,
  application_details->'final_fee_payment'->>'payable_amount' as amount,
  application_details->'final_fee_payment'->'payment_history' as history
FROM public.users_duplicate
WHERE application_details IS NOT NULL
LIMIT 5;
```

### Step 5: Set Default Structure for New Users

Run this to ensure new users have the correct structure:

```sql
-- Update default for new rows
ALTER TABLE public.users_duplicate
ALTER COLUMN application_details SET DEFAULT '{
  "final_fee_payment": {
    "token": null,
    "payment_at": null,
    "discount_full": null,
    "token_expires": null,
    "payable_amount": null,
    "payment_method": null,
    "payment_status": "pending",
    "payment_history": [],
    "installment1_amount": null,
    "installment2_amount": null
  }
}'::jsonb;
```

## Testing the Payment Flow

### 1. Set Up Test Payment Token

In your admin app, generate a payment link for a test user with a small amount (e.g., ₹1).

### 2. Complete Test Payment

1. Click the payment link: `/pay?v=<JWT_TOKEN>&type=razorpay`
2. Click "Pay Now"
3. Use Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - OTP: `123456`

### 3. Verify Payment Stored

After successful payment, run this query:

```sql
SELECT
  id,
  basic->>'student_name' as name,
  contact->>'email' as email,
  application_details->'final_fee_payment'->>'payment_status' as status,
  application_details->'final_fee_payment'->>'razorpay_payment_id' as payment_id,
  application_details->'final_fee_payment'->>'payment_at' as paid_at,
  application_details->'final_fee_payment'->'payment_history' as history
FROM public.users_duplicate
WHERE application_details->'final_fee_payment'->>'payment_status' = 'paid'
ORDER BY application_details->'final_fee_payment'->>'payment_at' DESC
LIMIT 10;
```

You should see:
- `status`: `"paid"`
- `payment_id`: `"pay_xxxxx"` (Razorpay payment ID)
- `paid_at`: ISO timestamp
- `history`: Array with payment events

## Troubleshooting

### Payment still not saving

1. **Check server logs** during payment:
   ```bash
   npm run dev
   ```
   Look for `[verify]` logs showing the update process

2. **Check for errors**:
   - Look for "Failed to update payment status" in logs
   - Check if `applicationId` is being found correctly

3. **Manually verify the update query**:
   ```sql
   -- Try manual update with your user ID
   UPDATE public.users_duplicate
   SET application_details = jsonb_set(
     COALESCE(application_details, '{}'::jsonb),
     '{final_fee_payment,payment_status}',
     '"paid"'::jsonb
   )
   WHERE id = '<your-test-user-id>'
   RETURNING application_details->'final_fee_payment';
   ```

### Column still doesn't exist

If the column doesn't exist after migration, check:

```sql
-- Verify column exists
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'users_duplicate'
    AND column_name = 'application_details'
    AND table_schema = 'public'
) as column_exists;
```

If returns `false`, contact Supabase support or check table permissions.

## Code Changes Made

1. **Updated TypeScript interface**: [src/lib/userFieldMapping.ts](src/lib/userFieldMapping.ts)
   - Added `application_details` with `final_fee_payment` structure

2. **Payment endpoints already support**:
   - ✅ [create-order/route.ts](src/app/api/payments/razorpay/create-order/route.ts) - Saves order_id
   - ✅ [verify/route.ts](src/app/api/payments/razorpay/verify/route.ts) - Updates payment status

## Next Steps

After fixing the database:

1. ✅ Run the SQL migration above
2. ✅ Verify column exists
3. ✅ Restart your dev server: `npm run dev`
4. ✅ Test a payment flow end-to-end
5. ✅ Check database to confirm payment data is saved
6. ✅ Deploy to production

## Support

If you continue to experience issues:

1. Share the output of the "Check Your Current Table Structure" query
2. Share any error logs from the server during payment
3. Share a screenshot of the payment_history after a test payment
