# 🚀 Razorpay Webhook - Quick Reference

## 📍 Webhook Endpoint

```
POST https://yourdomain.com/api/payments/razorpay/webhook
```

## 🔑 Environment Variables Required

```bash
RAZORPAY_KEY_ID=rzp_test_RcLRIG8PMpX09a          # ✅ Already set
RAZORPAY_KEY_SECRET=YtpAMMWX007amTqYk4O4Gs55     # ✅ Already set
RAZORPAY_WEBHOOK_SECRET=neram_webhook_secret_2025 # ✅ Already set
```

## ⚙️ Razorpay Dashboard Setup (ACTION REQUIRED)

1. Login: https://dashboard.razorpay.com/
2. Settings → Webhooks → Create Webhook
3. URL: `https://yourdomain.com/api/payments/razorpay/webhook`
4. Secret: `neram_webhook_secret_2025`
5. Events:
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ payment.authorized
   - ✅ order.paid
   - ✅ payment.refunded

## 🧪 Local Testing

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test webhook
npm run test:webhook
```

## 📊 Check Payment Status

**Logs to look for:**

```
✅ [razorpay:webhook] ✅ Signature verified
✅ [razorpay:webhook] 📬 Event: payment.captured
✅ [razorpay:webhook] ✅ Found application
✅ [razorpay:webhook] ✅ Payment status updated to: paid
```

**Database query:**

```sql
SELECT
  id,
  application_details->'final_fee_payment'->>'payment_status',
  application_details->'final_fee_payment'->>'razorpay_payment_id',
  application_details->'final_fee_payment'->>'last_webhook_event'
FROM users_duplicate
WHERE application_details->'final_fee_payment'->'razorpay_order_id' IS NOT NULL
ORDER BY application_details->'final_fee_payment'->>'last_webhook_at' DESC
LIMIT 5;
```

## 🎯 What Gets Stored

**In `application_details.final_fee_payment`:**

- ✅ payment_status ("pending" → "paid"/"failed")
- ✅ razorpay_payment_id
- ✅ payment_method (upi/card/netbanking/wallet)
- ✅ bank, wallet, upi_vpa (based on method)
- ✅ payment_at timestamp
- ✅ last_webhook_at, last_webhook_event
- ✅ error_code, error_description (if failed)
- ✅ Complete payment_history array with ALL details

## 🔒 Security Features

1. ✅ HMAC SHA256 signature verification
2. ✅ Idempotency (duplicate webhooks handled)
3. ✅ Order mapping (razorpay_order_id)
4. ✅ Comprehensive error logging

## 📁 Key Files

| File                                             | Purpose             |
| ------------------------------------------------ | ------------------- |
| `src/app/api/payments/razorpay/webhook/route.ts` | Webhook handler     |
| `scripts/test-webhook.mjs`                       | Test script         |
| `RAZORPAY_WEBHOOK_SETUP.md`                      | Full setup guide    |
| `PAYMENT_FLOW_DIAGRAM.md`                        | Visual flow diagram |

## ✅ Pre-Launch Checklist

- [ ] Webhook registered in Razorpay Dashboard
- [ ] Secrets match between app and dashboard
- [ ] Test payment completed (test mode)
- [ ] Webhook received and processed
- [ ] Database shows payment_status = "paid"
- [ ] payment_history contains entries
- [ ] Error handling works (test failed payment)

## 🆘 Troubleshooting

| Issue                   | Solution                                              |
| ----------------------- | ----------------------------------------------------- |
| "Invalid signature"     | Check RAZORPAY_WEBHOOK_SECRET matches dashboard       |
| "Application not found" | Verify razorpay_order_id saved in create-order        |
| "Already processed"     | Normal - idempotency working correctly                |
| No webhook received     | Check webhook URL in dashboard, verify events enabled |

## 📞 Need Help?

- Setup Guide: `RAZORPAY_WEBHOOK_SETUP.md`
- Flow Diagram: `PAYMENT_FLOW_DIAGRAM.md`
- Implementation: `RAZORPAY_IMPLEMENTATION_SUMMARY.md`
- Razorpay Docs: https://razorpay.com/docs/webhooks/

---

**Status**: ✅ Implementation Complete  
**Next Step**: Register webhook in Razorpay Dashboard  
**Test Command**: `npm run test:webhook`
