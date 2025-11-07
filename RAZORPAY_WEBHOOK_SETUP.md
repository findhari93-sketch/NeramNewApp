# Razorpay Webhook Integration Guide

## Overview

The Razorpay webhook handler receives and processes payment notifications from Razorpay, storing comprehensive payment details in the database. This is the **source of truth** for payment confirmation.

## Webhook Endpoint

- **URL**: `https://yourdomain.com/api/payments/razorpay/webhook`
- **Method**: POST only
- **Security**: HMAC SHA256 signature verification

## Setup Instructions

### 1. Configure Environment Variables

Add to your `.env.local`:

```bash
# Razorpay Webhook Secret (generate from Razorpay Dashboard)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Register Webhook in Razorpay Dashboard

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **Webhooks**
3. Click **Create Webhook**
4. Configure:
   - **Webhook URL**: `https://yourdomain.com/api/payments/razorpay/webhook`
   - **Secret**: Generate a strong secret (min 12 characters)
   - **Active Events**: Select these critical events:
     - ✅ `payment.captured` (Payment successful)
     - ✅ `payment.failed` (Payment failed)
     - ✅ `payment.authorized` (Payment authorized, needs capture)
     - ✅ `order.paid` (Order fully paid)
     - ✅ `payment.refunded` (Refund processed)
5. Save the webhook
6. Copy the **Secret** and add it to your `.env.local`

### 3. Test Locally with ngrok

For local development, use ngrok to expose your local server:

```bash
# Start your Next.js dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in Razorpay Dashboard
# Example: https://abc123.ngrok.io/api/payments/razorpay/webhook
```

## Webhook Events Handled

| Event                | Description                                  | Payment Status |
| -------------------- | -------------------------------------------- | -------------- |
| `payment.captured`   | Payment successful and captured              | `paid`         |
| `payment.failed`     | Payment attempt failed                       | `failed`       |
| `payment.authorized` | Payment authorized (requires manual capture) | `authorized`   |
| `order.paid`         | Order fully paid                             | `paid`         |
| `payment.refunded`   | Refund processed                             | `refunded`     |

## Data Stored in Database

The webhook stores comprehensive payment details in `users_duplicate.application_details.final_fee_payment`:

```typescript
{
  // Core payment info
  razorpay_order_id: string,
  razorpay_payment_id: string,
  payment_status: "pending" | "paid" | "failed" | "authorized" | "refunded",
  payment_at: string (ISO timestamp),
  payment_method: string, // "card", "upi", "netbanking", "wallet"

  // Payment details
  bank: string | null,
  wallet: string | null,
  upi_vpa: string | null,
  captured: boolean,
  international: boolean,

  // Error details (if failed)
  error_code: string | null,
  error_description: string | null,
  error_reason: string | null,

  // Webhook tracking
  last_webhook_at: string (ISO timestamp),
  last_webhook_event: string,

  // Complete payment history
  payment_history: [
    {
      event: string,
      webhook_id: string,
      payment_id: string,
      order_id: string,
      amount: number,
      amount_paid: number,
      amount_due: number,
      currency: string,
      status: string,
      method: string,
      bank: string | null,
      wallet: string | null,
      vpa: string | null,
      email: string | null,
      contact: string | null,
      fee: number | null,
      tax: number | null,
      error_code: string | null,
      error_description: string | null,
      error_source: string | null,
      error_step: string | null,
      error_reason: string | null,
      international: boolean,
      captured: boolean,
      description: string | null,
      card_id: string | null,
      acquirer_data: any,
      created_at: string (ISO timestamp),
      webhook_received_at: string (ISO timestamp),
      notes: object
    }
  ]
}
```

## Flow Diagram

```
┌─────────────────┐
│  Student pays   │
│  via Razorpay   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Razorpay processes payment     │
│  (captured/failed/authorized)   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Razorpay sends webhook         │
│  POST /api/.../webhook          │
│  + x-razorpay-signature header  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Webhook handler:               │
│  1. Verify HMAC signature       │
│  2. Extract payment details     │
│  3. Find application by order   │
│  4. Check idempotency           │
│  5. Update payment_status       │
│  6. Append to payment_history   │
│  7. Return 200 OK               │
└─────────────────────────────────┘
```

## Security Features

### 1. Signature Verification

Every webhook is verified using HMAC SHA256:

```typescript
const expectedSignature = crypto
  .createHmac("sha256", webhookSecret)
  .update(rawBody)
  .digest("hex");

if (expectedSignature !== signature) {
  return 400; // Reject invalid signature
}
```

### 2. Idempotency

Webhooks may be delivered multiple times. The handler checks if the same payment_id + event was already processed:

```typescript
const alreadyProcessed = paymentHistory.some(
  (entry) => entry.payment_id === paymentId && entry.event === event
);

if (alreadyProcessed) {
  return { ok: true, message: "Already processed" };
}
```

### 3. Order Mapping

The webhook finds the application by `razorpay_order_id` stored during order creation:

```typescript
// In create-order route:
await supabase.update({
  application_details: {
    final_fee_payment: {
      razorpay_order_id: order.id,
    },
  },
});

// In webhook handler:
const app = applications.find(
  (app) =>
    app.application_details.final_fee_payment.razorpay_order_id === orderId
);
```

## Testing Webhooks

### Manual Test with curl

```bash
# Generate test signature
WEBHOOK_SECRET="your_secret"
PAYLOAD='{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test123","order_id":"order_test123","amount":250000,"status":"captured","method":"upi"}}}}'

SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')

# Send webhook
curl -X POST http://localhost:3000/api/payments/razorpay/webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Test with Razorpay Dashboard

1. Go to **Settings** → **Webhooks**
2. Click on your webhook
3. Click **Send Test Webhook**
4. Select event type (e.g., `payment.captured`)
5. Click **Send**

## Troubleshooting

### Webhook Returns 400 (Invalid Signature)

**Cause**: Webhook secret mismatch

**Fix**:

1. Verify `RAZORPAY_WEBHOOK_SECRET` in `.env.local` matches Razorpay Dashboard
2. Restart your Next.js server after updating `.env.local`
3. Check for trailing spaces in the secret

### Webhook Returns 200 but No Database Update

**Cause**: Application not found by order_id

**Fix**:

1. Verify `razorpay_order_id` is being saved in `create-order` route
2. Check logs for "Application not found for order"
3. Ensure the order was created before payment

### Payment Shows as "pending" Despite Successful Webhook

**Cause**: Idempotency check triggered (already processed)

**Fix**:

1. Check `payment_history` array for duplicate entries
2. Review logs for "Already processed" message
3. This is expected behavior for duplicate webhooks

## Monitoring

### Key Logs to Watch

```bash
# Successful webhook
[razorpay:webhook] ✅ Signature verified
[razorpay:webhook] 📬 Event: payment.captured
[razorpay:webhook] ✅ Found application
[razorpay:webhook] ✅ Payment status updated to: paid

# Failed signature
[razorpay:webhook] ⚠️ Invalid signature

# Application not found
[razorpay:webhook] ⚠️ Application not found for order

# Idempotent (already processed)
[razorpay:webhook] ⚠️ Webhook already processed (idempotent)
```

### Database Query to Check Webhook Status

```sql
-- Check recent payment history
SELECT
  id,
  application_details->'final_fee_payment'->>'payment_status' as status,
  application_details->'final_fee_payment'->>'last_webhook_at' as last_webhook,
  jsonb_array_length(
    application_details->'final_fee_payment'->'payment_history'
  ) as webhook_count
FROM users_duplicate
WHERE application_details->'final_fee_payment' IS NOT NULL
ORDER BY application_details->'final_fee_payment'->>'last_webhook_at' DESC
LIMIT 10;
```

## Production Checklist

- [ ] `RAZORPAY_WEBHOOK_SECRET` configured in production environment
- [ ] Webhook URL registered in Razorpay Dashboard (production account)
- [ ] All critical events subscribed (`payment.captured`, `payment.failed`, etc.)
- [ ] HTTPS enabled on webhook endpoint
- [ ] Monitoring/alerting setup for webhook failures
- [ ] Log aggregation configured (e.g., Vercel logs, Datadog)
- [ ] Test payment completed successfully with webhook verification
- [ ] Database backup strategy in place

## Related Files

- **Webhook Handler**: `src/app/api/payments/razorpay/webhook/route.ts`
- **Create Order**: `src/app/api/payments/razorpay/create-order/route.ts`
- **Verify Payment**: `src/app/api/payments/razorpay/verify/route.ts`
- **Environment**: `.env.local`

## Support

For Razorpay webhook issues:

- [Razorpay Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Support](https://razorpay.com/support/)
