# Razorpay Payment Flow - Complete Visual Guide

## 🎯 Overview

This document shows the complete payment flow from payment link creation to webhook verification.

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN APPLICATION                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1. Admin creates payment link
                                  │    - userId, amount
                                  │    - Signs JWT with PAYMENT_TOKEN_SECRET
                                  ▼
                    ┌──────────────────────────────┐
                    │   JWT Token Generated        │
                    │   Contains: userId, amount   │
                    └──────────────┬───────────────┘
                                  │
                                  │ 2. Email sent to student
                                  │    with link: /pay?v=JWT_TOKEN
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STUDENT APPLICATION                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
        ┌───────────────────────┐    ┌──────────────────────┐
        │  /pay Page (Client)   │    │  Client decodes JWT  │
        │  - Decodes token      │    │  Shows: amount, etc. │
        │  - Shows payment UI   │    │  (No secret needed)  │
        └───────────┬───────────┘    └──────────────────────┘
                    │
                    │ 3. Student clicks "Pay Now"
                    │
                    ▼
        ┌────────────────────────────────────────┐
        │  POST /api/payments/razorpay/          │
        │       create-order                     │
        │                                        │
        │  ✓ Verify JWT (server-side)          │
        │  ✓ Check payment not already paid     │
        │  ✓ Create Razorpay order              │
        │  ✓ Save razorpay_order_id to DB      │
        │                                        │
        │  Returns: order_id, key_id            │
        └────────────┬───────────────────────────┘
                    │
                    │ 4. Order created successfully
                    │    razorpay_order_id saved in DB
                    ▼
        ┌────────────────────────────────────────┐
        │     Razorpay Checkout Opens            │
        │     (client-side SDK)                  │
        │                                        │
        │  - Shows amount, description           │
        │  - Student selects payment method      │
        │  - Enters payment details              │
        └────────────┬───────────────────────────┘
                    │
                    │ 5. Student completes payment
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RAZORPAY SERVERS                              │
└─────────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────────────┐
│  Payment        │    │   Async Webhook         │
│  Response       │    │   Notification          │
│  (immediate)    │    │   (reliable)            │
└────────┬────────┘    └───────────┬─────────────┘
         │                         │
         │ 6a. Response returns    │ 6b. Webhook sent
         │     to client with:     │     (within seconds)
         │     - razorpay_order_id │
         │     - razorpay_payment_id
         │     - razorpay_signature│
         │                         │
         ▼                         ▼
┌────────────────────────┐  ┌─────────────────────────────────┐
│  POST /api/payments/   │  │  POST /api/payments/razorpay/   │
│       razorpay/verify  │  │       webhook                   │
│                        │  │                                 │
│  ✓ Verify signature    │  │  ✓ Verify HMAC signature       │
│  ✓ Find by order_id    │  │  ✓ Find app by order_id        │
│  ✓ Check idempotency   │  │  ✓ Check idempotency           │
│  ✓ Update status       │  │  ✓ Extract ALL payment details │
│  ✓ Add to history      │  │  ✓ Update payment_status       │
│                        │  │  ✓ Append to payment_history   │
│  Returns: redirect URL │  │  ✓ Store error details (if any)│
└────────────────────────┘  │                                 │
                            │  Returns: 200 OK                │
                            └─────────────────────────────────┘
```

---

## 🗄️ Database State Changes

### Initial State (after order creation)

```json
{
  "final_fee_payment": {
    "token": "jwt_token_here",
    "token_expires": "2025-11-07T12:00:00Z",
    "token_used": false,
    "payable_amount": 2500,
    "payment_status": "pending",
    "razorpay_order_id": "order_LbYcX3GzvTz9Ue",
    "order_created_at": "2025-11-06T12:23:11.000Z",
    "payment_history": []
  }
}
```

### After Successful Payment (webhook processed)

```json
{
  "final_fee_payment": {
    "token": "jwt_token_here",
    "token_expires": "2025-11-07T12:00:00Z",
    "token_used": true,
    "payable_amount": 2500,
    "payment_status": "paid", // ← Changed
    "payment_at": "2025-11-06T12:25:30.000Z", // ← Added
    "razorpay_order_id": "order_LbYcX3GzvTz9Ue",
    "razorpay_payment_id": "pay_LbYfHQ6zWc7i6x", // ← Added
    "payment_method": "upi", // ← Added
    "upi_vpa": "student@paytm", // ← Added
    "captured": true, // ← Added
    "last_webhook_at": "2025-11-06T12:25:35.000Z", // ← Added
    "last_webhook_event": "payment.captured", // ← Added
    "payment_history": [
      // ← Populated
      {
        "event": "payment.verified",
        "source": "verify",
        "payment_id": "pay_LbYfHQ6zWc7i6x",
        "order_id": "order_LbYcX3GzvTz9Ue",
        "amount": 2500,
        "ts": "2025-11-06T12:25:30.000Z"
      },
      {
        "event": "payment.captured",
        "source": "webhook",
        "webhook_id": "pay_LbYfHQ6zWc7i6x",
        "payment_id": "pay_LbYfHQ6zWc7i6x",
        "order_id": "order_LbYcX3GzvTz9Ue",
        "amount": 2500,
        "currency": "INR",
        "status": "captured",
        "method": "upi",
        "vpa": "student@paytm",
        "email": "student@example.com",
        "contact": "+916380194614",
        "fee": 59,
        "tax": 9,
        "captured": true,
        "international": false,
        "created_at": "2025-11-06T12:25:20.000Z",
        "webhook_received_at": "2025-11-06T12:25:35.000Z",
        "notes": {
          "batch": "Crash 2026",
          "course": "NATA/JEE2 Crash Course"
        }
      }
    ]
  }
}
```

---

## 🔒 Security Layers

### 1. JWT Token Verification (Payment Link)

```
Admin signs: HMAC-SHA256(payload, PAYMENT_TOKEN_SECRET)
Student app verifies: Same secret on server-side only
```

### 2. Razorpay Signature Verification (Client Payment)

```
Expected = HMAC-SHA256(order_id|payment_id, RAZORPAY_KEY_SECRET)
Match with razorpay_signature from Razorpay response
```

### 3. Webhook Signature Verification (Server)

```
Expected = HMAC-SHA256(raw_body, RAZORPAY_WEBHOOK_SECRET)
Match with x-razorpay-signature header
```

---

## 📊 Payment History Timeline

```
Timeline of a successful payment:

T+0s:   Student clicks "Pay Now"
        └─→ create-order saves razorpay_order_id

T+1s:   Razorpay checkout opens
        └─→ Student sees payment form

T+10s:  Student completes payment
        └─→ Payment processed by Razorpay

T+11s:  Payment response returns to client
        └─→ verify route updates status
        └─→ First entry in payment_history

T+12s:  Webhook sent by Razorpay
        └─→ webhook route processes
        └─→ Second entry in payment_history
        └─→ Final authoritative confirmation

All entries preserved in payment_history array!
```

---

## 🧪 Test Scenarios

### Scenario 1: Successful Payment (UPI)

```
Input:
  - Token: Valid JWT with userId + amount
  - Method: UPI
  - Status: Success

Expected DB State:
  - payment_status: "paid"
  - payment_method: "upi"
  - upi_vpa: "user@bank"
  - captured: true
  - payment_history: 2 entries (verify + webhook)
```

### Scenario 2: Failed Payment (Insufficient Balance)

```
Input:
  - Token: Valid JWT
  - Method: UPI
  - Status: Failed

Expected DB State:
  - payment_status: "failed"
  - error_code: "BAD_REQUEST_ERROR"
  - error_description: "Payment failed..."
  - error_reason: "payment_declined"
  - payment_history: 1+ entries with failure details
```

### Scenario 3: Duplicate Webhook (Idempotency)

```
Input:
  - Same payment_id sent twice

Expected Behavior:
  - First webhook: Processed, DB updated
  - Second webhook: Detected as duplicate
  - Response: 200 OK "Already processed"
  - DB: No duplicate entry in payment_history
```

---

## 🎯 Integration Points

### 1. Admin App → Student App

- **What**: JWT token with payment details
- **How**: Email link with `/pay?v=TOKEN`
- **Security**: PAYMENT_TOKEN_SECRET (shared between apps)

### 2. Student App → Razorpay

- **What**: Order creation and checkout
- **How**: Razorpay SDK (client + server)
- **Security**: RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET

### 3. Razorpay → Student App

- **What**: Webhook notifications
- **How**: POST to /api/payments/razorpay/webhook
- **Security**: RAZORPAY_WEBHOOK_SECRET (HMAC verification)

---

## 📝 Checklist for Production

- [ ] All environment variables configured
- [ ] Webhook URL registered in Razorpay Dashboard
- [ ] Test payment completed successfully (test mode)
- [ ] Webhook received and verified in logs
- [ ] Database updated with complete payment details
- [ ] Failed payment handled correctly
- [ ] Duplicate webhook handled (idempotent)
- [ ] Error tracking/alerting configured
- [ ] Production secrets rotated from test keys
- [ ] SSL/HTTPS enabled for webhook endpoint
- [ ] Monitoring dashboard set up

---

## 🚀 Quick Start Commands

```bash
# 1. Start dev server
npm run dev

# 2. Test webhook locally (in another terminal)
npm run test:webhook

# 3. Check logs for:
[razorpay:webhook] ✅ Signature verified
[razorpay:webhook] ✅ Payment status updated to: paid

# 4. Query database to verify
# (Use SQL from RAZORPAY_IMPLEMENTATION_SUMMARY.md)
```

---

**Questions?** Check:

- `RAZORPAY_WEBHOOK_SETUP.md` - Detailed setup guide
- `RAZORPAY_IMPLEMENTATION_SUMMARY.md` - Implementation details
- Razorpay Docs: https://razorpay.com/docs/webhooks/
