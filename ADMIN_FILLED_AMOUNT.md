# Admin-Controlled Payment Amounts

## Overview

The Razorpay payment flow now uses the **admin_filled** JSONB column to determine the payment amount, giving admins full control over what students pay.

## Amount Priority Order

The system checks for the amount in this order:

1. ✅ **admin_filled.amount** (highest priority)
2. ✅ **admin_filled.final_amount**
3. ✅ **admin_filled.payable_amount**
4. ⚠️ **final_fee_payment.payable_amount** (fallback)
5. ⚠️ **JWT token amount** (ultimate fallback, JWT flow only)

## How to Set the Amount

### Option 1: Using `admin_filled.amount` (Recommended)

```sql
UPDATE users_duplicate
SET admin_filled = jsonb_set(
  COALESCE(admin_filled, '{}'::jsonb),
  '{amount}',
  '5000'::jsonb
)
WHERE id = '<user-id>';
```

### Option 2: Using `admin_filled.final_amount`

```sql
UPDATE users_duplicate
SET admin_filled = jsonb_set(
  COALESCE(admin_filled, '{}'::jsonb),
  '{final_amount}',
  '5000'::jsonb
)
WHERE id = '<user-id>';
```

### Option 3: Using `admin_filled.payable_amount`

```sql
UPDATE users_duplicate
SET admin_filled = jsonb_set(
  COALESCE(admin_filled, '{}'::jsonb),
  '{payable_amount}',
  '5000'::jsonb
)
WHERE id = '<user-id>';
```

## Typical Admin Workflow

1. **Student submits application**
2. **Admin reviews and approves**
3. **Admin sets payment amount in admin_filled:**
   ```sql
   UPDATE users_duplicate
   SET
     admin_filled = jsonb_build_object(
       'amount', 5000,
       'approved_by', 'admin@example.com',
       'approved_at', NOW()
     ),
     application_details = jsonb_set(
       COALESCE(application_details, '{}'::jsonb),
       '{application_admin_approval}',
       '"Approved"'::jsonb
     )
   WHERE id = '<user-id>';
   ```
4. **Admin generates payment link** (JWT token or DB token)
5. **Student clicks link and pays the admin-set amount**

## Example: Full Payment Flow

### Step 1: Set Amount in Database

```sql
-- Set the amount admin wants student to pay
UPDATE users_duplicate
SET admin_filled = jsonb_build_object(
  'amount', 5000,
  'discount_applied', 1000,
  'original_amount', 6000,
  'approved_by', 'admin_user_id',
  'approved_at', NOW()::text
)
WHERE id = '7b31c431-54eb-4fb6-908a-de0e41a363b2';
```

### Step 2: Generate Payment Token (Admin App)

```javascript
// In your admin app
const jwt = require('jsonwebtoken');

const paymentToken = jwt.sign(
  {
    userId: '7b31c431-54eb-4fb6-908a-de0e41a363b2',
    amount: 5000, // This will be overridden by admin_filled.amount
    type: 'razorpay'
  },
  process.env.PAYMENT_TOKEN_SECRET,
  { expiresIn: '7d' }
);

const paymentLink = `https://your-app.com/pay?v=${paymentToken}&type=razorpay`;
```

### Step 3: Student Completes Payment

When student clicks the link:
1. System fetches `admin_filled.amount` from database
2. Creates Razorpay order with **₹5000** (from admin_filled, not JWT)
3. Student completes payment
4. Payment details saved to `final_fee_payment`

## Checking What Amount Will Be Charged

```sql
-- See what amount will be used for a student
SELECT
  id,
  basic->>'student_name' as name,
  admin_filled->>'amount' as admin_amount,
  admin_filled->>'final_amount' as admin_final_amount,
  admin_filled->>'payable_amount' as admin_payable,
  final_fee_payment->>'payable_amount' as fee_payable,
  COALESCE(
    admin_filled->>'amount',
    admin_filled->>'final_amount',
    admin_filled->>'payable_amount',
    final_fee_payment->>'payable_amount',
    '0'
  )::numeric as actual_charge_amount
FROM users_duplicate
WHERE id = '<user-id>';
```

## Common admin_filled Structure

```json
{
  "amount": 5000,
  "original_amount": 6000,
  "discount_applied": 1000,
  "discount_reason": "Early bird discount",
  "approved_by": "admin_user_id",
  "approved_at": "2025-11-27T12:00:00Z",
  "notes": "Special scholarship student"
}
```

## Debugging

### Check Payment Amount Logs

In your server logs during payment creation, look for:

```
[razorpay:create-order] Using amount from admin_filled {
  adminFilled: { amount: 5000, ... },
  finalFeeAmount: 6000,
  selectedAmount: 5000
}
```

### Verify Amount in Database

```sql
SELECT
  id,
  admin_filled,
  final_fee_payment->>'payable_amount' as old_amount,
  admin_filled->>'amount' as new_amount
FROM users_duplicate
WHERE id = '<user-id>';
```

## Migration from Old System

If you were using `final_fee_payment.payable_amount`, you can migrate:

```sql
-- Copy payable_amount from final_fee_payment to admin_filled
UPDATE users_duplicate
SET admin_filled = jsonb_set(
  COALESCE(admin_filled, '{}'::jsonb),
  '{amount}',
  (final_fee_payment->>'payable_amount')::jsonb
)
WHERE final_fee_payment->>'payable_amount' IS NOT NULL
  AND (admin_filled->>'amount') IS NULL;
```

## Recommended Field Name

For consistency, we recommend using **`admin_filled.amount`** as your primary field.

```sql
-- Recommended structure
{
  "amount": 5000,  // ← Use this field
  "approved_by": "admin_id",
  "approved_at": "2025-11-27T..."
}
```
