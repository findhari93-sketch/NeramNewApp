# Account Type Auto-Update Based on Payment Status

## Overview

The user's **Account Type** in their profile now automatically updates from `"Free"` to `"Paid Premium Student"` when they successfully complete a payment through Razorpay.

## How It Works

### 1. Payment Status Detection

When a user completes a payment:

- Razorpay webhook updates `users_duplicate.application_details.final_fee_payment.payment_status` to `"paid"`
- The `mapFromUsersDuplicate()` function automatically detects this status
- Account type is computed dynamically based on payment status

### 2. Account Type Computation Logic

**File**: `src/lib/userFieldMapping.ts`

```typescript
const paymentStatus = applicationDetails.final_fee_payment?.payment_status;
const computedAccountType =
  paymentStatus === "paid"
    ? "Paid Premium Student"
    : account.account_type || "Free";
```

**Rules**:

- If `payment_status === "paid"` → Account Type = `"Paid Premium Student"`
- Otherwise → Use `account.account_type` or default to `"Free"`

### 3. Profile Page Display

**File**: `src/app/(main)/profile/page.tsx`

**Before Payment**:

```
Account Type: Free
```

**After Payment**:

```
Account Type: Paid Premium Student [Premium Badge]
```

**Visual Enhancements**:

- Green "Premium" badge chip displayed next to account type
- Badge only shows when payment status is "paid"
- Professional styling with green background (#4caf50)

## Code Changes

### Modified Files

#### 1. `src/lib/userFieldMapping.ts`

**Added**:

- Dynamic account type computation based on payment status
- Flattened `payment_status`, `razorpay_payment_id`, `payment_at` fields for easy access
- Included `application_details` in mapped output

**Changes**:

```typescript
// NEW: Extract application details
const applicationDetails = dbRow.application_details || {};

// NEW: Compute account type dynamically
const computedAccountType = paymentStatus === 'paid'
  ? 'Paid Premium Student'
  : (account.account_type || 'Free');

// UPDATED: Use computed account type
account_type: computedAccountType,
accountType: computedAccountType,

// NEW: Add payment fields for easy access
payment_status: applicationDetails.final_fee_payment?.payment_status,
paymentStatus: applicationDetails.final_fee_payment?.payment_status,
razorpay_payment_id: applicationDetails.final_fee_payment?.razorpay_payment_id,
payment_at: applicationDetails.final_fee_payment?.payment_at,

// NEW: Include full application details
application_details: dbRow.application_details,
applicationDetails: dbRow.application_details,
```

#### 2. `src/app/(main)/profile/page.tsx`

**Added**:

- Green "Premium" badge chip for paid users
- Conditional rendering based on payment status
- Enhanced visual feedback for premium accounts

**Changes**:

```tsx
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <Typography variant="body2">
    {(user as any)?.accountType || "Free"}
  </Typography>
  {((user as any)?.payment_status === "paid" ||
    (user as any)?.accountType === "Paid Premium Student") && (
    <Chip
      label="Premium"
      size="small"
      sx={{
        backgroundColor: "#4caf50",
        color: "white",
        fontWeight: "bold",
        fontSize: "0.7rem",
      }}
    />
  )}
</Box>
```

## User Experience Flow

```
User Completes Payment
        ↓
Razorpay Webhook Updates Database
        ↓
payment_status = "paid" in users_duplicate.application_details
        ↓
User Refreshes Profile Page (or auto-refresh via useSyncedUser)
        ↓
mapFromUsersDuplicate() computes account type
        ↓
Profile displays "Paid Premium Student" with Premium badge ✅
```

## Real-Time Updates

The `useSyncedUser` hook provides real-time updates:

1. **localStorage Cache**: Immediate update on page load
2. **Supabase Realtime**: Automatic refresh when database changes
3. **No Manual Refresh Required**: Changes propagate automatically

## Testing

### Test Successful Payment Flow

1. **Create test payment**:

   ```bash
   npm run test:webhook
   ```

2. **Update payment status manually** (for testing):

   ```sql
   UPDATE users_duplicate
   SET application_details = jsonb_set(
     COALESCE(application_details, '{}'::jsonb),
     '{final_fee_payment,payment_status}',
     '"paid"'
   )
   WHERE contact->>'email' = 'test@example.com';
   ```

3. **Verify profile page**:
   - Navigate to `/profile`
   - Account Type should show: **"Paid Premium Student"**
   - Green **"Premium"** badge should appear
   - Refresh page to see real-time update

### Test Free Account

1. **Check user without payment**:

   ```sql
   SELECT
     basic->>'student_name' AS name,
     contact->>'email' AS email,
     application_details->'final_fee_payment'->>'payment_status' AS status,
     account->>'account_type' AS account_type
   FROM users_duplicate
   WHERE contact->>'email' = 'free@example.com';
   ```

2. **Expected Result**:
   - payment_status: `null` or `"pending"`
   - Account Type displays: **"Free"**
   - No Premium badge shown

## Database Query Examples

### Check User Payment Status

```sql
SELECT
  id,
  basic->>'student_name' AS student_name,
  contact->>'email' AS email,
  application_details->'final_fee_payment'->>'payment_status' AS payment_status,
  application_details->'final_fee_payment'->>'razorpay_payment_id' AS payment_id,
  application_details->'final_fee_payment'->>'payment_at' AS payment_date,
  account->>'account_type' AS original_account_type
FROM users_duplicate
WHERE application_details->'final_fee_payment'->>'payment_status' = 'paid'
ORDER BY (application_details->'final_fee_payment'->>'payment_at')::timestamptz DESC;
```

### Count Users by Account Type

```sql
SELECT
  CASE
    WHEN application_details->'final_fee_payment'->>'payment_status' = 'paid'
      THEN 'Paid Premium Student'
    ELSE COALESCE(account->>'account_type', 'Free')
  END AS computed_account_type,
  COUNT(*) AS user_count
FROM users_duplicate
GROUP BY computed_account_type
ORDER BY user_count DESC;
```

## Edge Cases Handled

### 1. Partial Payment / Failed Payment

- If `payment_status` is `"failed"` or `"pending"` → Shows **"Free"**
- No Premium badge displayed

### 2. Refunded Payment

- If `payment_status` changes to `"refunded"` → Shows **"Free"**
- Premium badge automatically removed

### 3. Multiple Payments (Installments)

- System checks final_fee_payment status
- Any successful payment (paid status) triggers Premium designation

### 4. Missing Payment Data

- If `application_details` is null/empty → Defaults to **"Free"**
- Graceful fallback to prevent errors

## Customization

### Change Account Type Label

Edit `src/lib/userFieldMapping.ts`:

```typescript
const computedAccountType =
  paymentStatus === "paid"
    ? "Premium Member" // Change this text
    : account.account_type || "Free";
```

### Change Badge Color

Edit `src/app/(main)/profile/page.tsx`:

```tsx
<Chip
  label="Premium"
  sx={{
    backgroundColor: "#ff9800", // Orange instead of green
    color: "white",
  }}
/>
```

### Add Additional Payment Tiers

Extend the logic to support multiple tiers:

```typescript
const computedAccountType =
  paymentStatus === "paid" && paymentAmount >= 50000
    ? "Platinum Premium Student"
    : paymentStatus === "paid" && paymentAmount >= 25000
    ? "Gold Premium Student"
    : paymentStatus === "paid"
    ? "Paid Premium Student"
    : account.account_type || "Free";
```

## Benefits

✅ **Automatic**: No manual admin intervention required  
✅ **Real-time**: Updates immediately after payment  
✅ **Accurate**: Single source of truth (payment_status)  
✅ **Scalable**: Works for unlimited users  
✅ **User-friendly**: Clear visual indicator of premium status  
✅ **Cache-aware**: Works with localStorage and Supabase realtime

## Troubleshooting

### Issue: Account Type Not Updating After Payment

**Check**:

1. Verify payment status in database:
   ```sql
   SELECT application_details->'final_fee_payment'->>'payment_status'
   FROM users_duplicate WHERE id = 'user-uuid';
   ```
2. Check if webhook processed successfully (see webhook logs)
3. Clear localStorage cache: `localStorage.removeItem('user-cache:USER_ID')`
4. Hard refresh profile page (Ctrl+Shift+R)

### Issue: Premium Badge Not Showing

**Check**:

1. Verify payment_status === "paid"
2. Check console for React errors
3. Ensure MUI Chip component imported correctly
4. Verify conditional logic in profile page

### Issue: Shows "Free" Despite Paid Status

**Check**:

1. Verify `mapFromUsersDuplicate` is using updated code
2. Check if `application_details` is null in database
3. Verify user object structure in browser console: `console.log(user)`

## Future Enhancements

Potential improvements:

1. **Expiry Date**: Add subscription expiry logic
2. **Multi-tier**: Support Bronze/Silver/Gold/Platinum tiers
3. **Trial Period**: Show "Trial Premium" for limited time
4. **Payment History**: Display all past payments in profile
5. **Upgrade CTA**: Show "Upgrade to Premium" button for free users

---

**Implementation Date**: December 1, 2025  
**Status**: ✅ Production Ready  
**Auto-updates**: Yes (real-time via Supabase)
