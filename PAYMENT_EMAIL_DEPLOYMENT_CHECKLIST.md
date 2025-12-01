# Payment Email & Notification Implementation - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Database Setup

- [ ] Verify `notifications` table exists in Supabase
  - Run: `scripts/verify-notifications-setup.sql` (queries 1-6)
- [ ] Confirm all indexes are created (6 total)
- [ ] Verify foreign key constraint to `users_duplicate` table
- [ ] Test notification insertion manually

**Command**:

```bash
# Open Supabase SQL Editor and run:
SELECT * FROM information_schema.tables WHERE table_name = 'notifications';
```

### 2. Environment Variables

Verify all required env vars are set in production:

- [ ] `SUPABASE_URL` ✅ (already configured)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ✅ (already configured)
- [ ] `RAZORPAY_WEBHOOK_SECRET` ✅ (already configured)
- [ ] `AZ_TENANT_ID` (Microsoft Azure AD)
- [ ] `AZ_CLIENT_ID` (Microsoft Azure AD)
- [ ] `AZ_CLIENT_SECRET` (Microsoft Azure AD)
- [ ] `AZ_SENDER_USER` (e.g., no-reply@neramclasses.com)
- [ ] `HELP_DESK_EMAIL` (e.g., support@neram.co.in)

**Verify**:

```bash
# Check if Azure AD variables are set
echo $AZ_TENANT_ID
echo $AZ_CLIENT_ID
echo $AZ_SENDER_USER
```

### 3. Admin Users Setup

- [ ] Identify who should receive admin notifications
- [ ] Set `account.role = "admin"` for admin users in `users_duplicate`

**SQL**:

```sql
-- Check current admins
SELECT id, basic->>'student_name', contact->>'email', account->>'role'
FROM users_duplicate
WHERE account->>'role' = 'admin';

-- If none, set admin role manually
UPDATE users_duplicate
SET account = jsonb_set(COALESCE(account, '{}'::jsonb), '{role}', '"admin"')
WHERE contact->>'email' IN ('admin@neramclasses.com', 'support@neram.co.in');
```

### 4. Email Service Testing

- [ ] Test Microsoft Graph API authentication
- [ ] Verify sender email has "Send As" permissions in Microsoft 365
- [ ] Test PDF invoice generation locally
- [ ] Send test email to yourself

**Test Command**:

```bash
# Run email test script
node test-email.js
```

### 5. Code Deployment

- [ ] Code changes committed to repository
- [ ] No TypeScript/ESLint errors
- [ ] Webhook route file updated: `src/app/api/payments/razorpay/webhook/route.ts`
- [ ] Email service file exists: `src/lib/emailService.ts`
- [ ] Invoice generation file exists: `src/lib/invoice.ts`

**Verify**:

```bash
npm run typecheck
npm run lint
```

---

## 🧪 Testing Checklist

### Test Scenario 1: Successful Payment

1. [ ] Create test Razorpay payment
2. [ ] Trigger webhook (use ngrok + test-webhook.mjs)
3. [ ] Verify database update:
   ```sql
   SELECT application_details->'final_fee_payment'->>'payment_status'
   FROM users_duplicate
   WHERE id = 'user-uuid';
   ```
4. [ ] Check user received email with PDF invoice
5. [ ] Verify user notification created:
   ```sql
   SELECT * FROM notifications
   WHERE user_id = 'user-uuid'
     AND notification_type = 'payment_completed'
   ORDER BY created_at DESC LIMIT 1;
   ```
6. [ ] Verify admin notification(s) created:
   ```sql
   SELECT * FROM notifications
   WHERE notification_type = 'payment_completed'
     AND user_id IN (SELECT id FROM users_duplicate WHERE account->>'role' = 'admin')
   ORDER BY created_at DESC;
   ```

### Test Scenario 2: Failed Payment

1. [ ] Simulate failed payment webhook
2. [ ] Verify `payment_status` = 'failed' in database
3. [ ] Check user notification created (type: payment_failed)
4. [ ] Confirm NO email sent (only for successful payments)

### Test Scenario 3: Admin Notification Display

1. [ ] Implement admin dashboard notification component
2. [ ] Verify unread count badge shows correctly
3. [ ] Test "Mark as read" functionality
4. [ ] Test "Mark all as read" functionality
5. [ ] Test real-time notification updates (Supabase channels)

---

## 📊 Monitoring & Verification

### Post-Deployment Monitoring (First 24 Hours)

#### Check Email Delivery

- [ ] Monitor Azure/Graph API logs for email failures
- [ ] Check help desk BCC emails are arriving
- [ ] Verify PDF attachments are < 5MB and opening correctly

**Query Recent Emails**:

```sql
-- Check payments processed in last 24 hours
SELECT
  id,
  basic->>'student_name' AS student,
  contact->>'email' AS email,
  application_details->'final_fee_payment'->>'payment_status' AS status,
  application_details->'final_fee_payment'->>'razorpay_payment_id' AS payment_id,
  application_details->'final_fee_payment'->'payment_history'->-1->>'webhook_received_at' AS payment_time
FROM users_duplicate
WHERE application_details->'final_fee_payment'->>'payment_status' = 'paid'
  AND (application_details->'final_fee_payment'->'payment_history'->-1->>'webhook_received_at')::timestamptz
      > NOW() - INTERVAL '24 hours'
ORDER BY (application_details->'final_fee_payment'->'payment_history'->-1->>'webhook_received_at')::timestamptz DESC;
```

#### Check Notification Creation

- [ ] Verify user notifications are being created
- [ ] Verify admin notifications are being created
- [ ] Check notification data JSON is populated correctly

**Query**:

```sql
-- Notifications created in last 24 hours
SELECT
  n.id,
  n.notification_type,
  n.title,
  n.priority,
  n.is_read,
  n.created_at,
  u.basic->>'student_name' AS user_name,
  u.account->>'role' AS user_role
FROM notifications n
JOIN users_duplicate u ON n.user_id = u.id
WHERE n.created_at > NOW() - INTERVAL '24 hours'
ORDER BY n.created_at DESC;
```

#### Check Webhook Logs

- [ ] Review server logs for webhook processing
- [ ] Verify no email sending errors
- [ ] Confirm notification creation success

**Log Patterns to Look For**:

```
✅ Payment status updated to: paid
✅ Payment confirmation email sent
✅ Notification created (user)
✅ Notification created (admin)
✅ Email and notifications sent for successful payment
```

---

## 🚨 Troubleshooting Guide

### Issue: Emails Not Sending

**Symptoms**: Payment successful, database updated, but no email received

**Diagnosis Steps**:

1. Check server logs for email errors:

   ```
   ⚠️ Cannot send email: Graph token not available
   ❌ Error sending payment confirmation email
   ```

2. Verify Azure AD credentials:

   ```bash
   # Test Graph token retrieval
   curl -X POST "https://login.microsoftonline.com/$AZ_TENANT_ID/oauth2/v2.0/token" \
     -d "client_id=$AZ_CLIENT_ID" \
     -d "client_secret=$AZ_CLIENT_SECRET" \
     -d "scope=https://graph.microsoft.com/.default" \
     -d "grant_type=client_credentials"
   ```

3. Check sender permissions in Microsoft 365 Admin Center

**Fix**:

- Ensure all Azure AD env vars are set correctly
- Verify sender email has "Send As" permissions
- Check help desk email is valid

### Issue: Admin Notifications Not Created

**Symptoms**: User notifications work, but admins not receiving notifications

**Diagnosis**:

```sql
-- Check if any admin users exist
SELECT COUNT(*) FROM users_duplicate WHERE account->>'role' = 'admin';
```

**Fix**:

```sql
-- Set admin role for specific users
UPDATE users_duplicate
SET account = jsonb_set(COALESCE(account, '{}'::jsonb), '{role}', '"admin"')
WHERE contact->>'email' IN ('admin@neramclasses.com');
```

### Issue: PDF Not Attaching

**Symptoms**: Email received but no PDF attachment

**Diagnosis**:

1. Check pdf-lib package installed: `npm list pdf-lib`
2. Review server logs for PDF generation errors
3. Verify attachment size < 5MB

**Fix**:

```bash
npm install pdf-lib
```

### Issue: Webhook 400/500 Errors

**Symptoms**: Razorpay webhook failing, payments not updating

**Diagnosis**:

1. Check webhook signature verification
2. Verify `RAZORPAY_WEBHOOK_SECRET` is correct
3. Check database connection

**Test**:

```bash
npm run test:webhook
```

---

## 📈 Success Metrics

Track these KPIs after deployment:

### Week 1

- [ ] Email delivery rate > 95%
- [ ] Notification creation rate = 100% of payments
- [ ] Zero webhook processing errors
- [ ] Average webhook processing time < 3 seconds

### Month 1

- [ ] User satisfaction survey results
- [ ] Admin response time to payment notifications
- [ ] Email open rates (if tracking available)
- [ ] PDF download/view rates

**Query for Metrics**:

```sql
-- Payment and notification success rate (last 30 days)
SELECT
  COUNT(*) AS total_payments,
  COUNT(*) FILTER (WHERE application_details->'final_fee_payment'->>'payment_status' = 'paid') AS successful_payments,
  (
    SELECT COUNT(*) FROM notifications
    WHERE notification_type = 'payment_completed'
      AND created_at > NOW() - INTERVAL '30 days'
  ) AS user_notifications,
  (
    SELECT COUNT(*) FROM notifications
    WHERE notification_type = 'payment_completed'
      AND user_id IN (SELECT id FROM users_duplicate WHERE account->>'role' = 'admin')
      AND created_at > NOW() - INTERVAL '30 days'
  ) AS admin_notifications
FROM users_duplicate
WHERE (application_details->'final_fee_payment'->'payment_history'->-1->>'webhook_received_at')::timestamptz
      > NOW() - INTERVAL '30 days';
```

---

## 🔄 Rollback Plan

If critical issues arise:

### Quick Disable (Without Rollback)

Comment out email/notification logic in webhook route:

```typescript
// TEMPORARILY DISABLED - EMAIL ISSUES
// await sendPaymentConfirmationEmail(...);
// await createNotification(...);
```

Deploy this change immediately to stop emails while you debug.

### Full Rollback

```bash
git revert HEAD  # Revert last commit
git push origin main --force
```

### Partial Rollback Options

- Disable only email sending (keep notifications)
- Disable only admin notifications (keep user notifications)
- Disable only notifications (keep emails)

---

## ✅ Final Sign-Off

Before marking as production-ready:

- [ ] All pre-deployment checks completed
- [ ] Test scenarios 1-3 passed successfully
- [ ] Monitoring queries bookmarked
- [ ] Troubleshooting guide reviewed
- [ ] Rollback plan documented and tested
- [ ] Team trained on admin notification UI
- [ ] Help desk informed of new email format
- [ ] User documentation updated (if applicable)

**Deployment Approved By**: ********\_********  
**Date**: ********\_********  
**Environment**: [ ] Staging [ ] Production

---

## 📞 Support Contacts

**Technical Issues**: support@neram.co.in  
**Azure/Email Issues**: Check Azure Portal > Azure AD > Logs  
**Database Issues**: Check Supabase Dashboard > Logs

**Emergency Rollback**: Run rollback plan above, notify team immediately.

---

**Document Version**: 1.0  
**Last Updated**: December 1, 2025  
**Next Review**: January 1, 2026
