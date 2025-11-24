# Quick Fix Guide: Production Email Issues

## 🚨 Problem

Emails work in development but not in production.

## ✅ Solution (2 Steps)

### Step 1: Fix Vercel Environment Variables

Go to: https://vercel.com/your-project/settings/environment-variables

Add/Update these variables for **Production**:

```bash
# Most Important - Fix These First
NEXT_PUBLIC_APP_URL=https://neramclasses.com
SMTP_PASS=<your-production-sendgrid-api-key>
MAIL_FROM=noreply@neramclasses.com

# Verify These Are Set
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_SECURE=false
```

### Step 2: Redeploy

After setting variables, redeploy your app:

- Option A: Push a commit to trigger auto-deploy
- Option B: Click "Redeploy" in Vercel dashboard

---

## 🧪 Test Email in Production

After redeploying, visit:

```
https://neramclasses.com/api/test-email?to=your-email@example.com
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Email sent successfully!",
  "messageId": "...",
  "environment": {
    "SMTP_HOST": "smtp.sendgrid.net",
    "hasSmtpPass": true
  }
}
```

---

## 📋 SendGrid Setup Checklist

1. **Create Production API Key**

   - Go to: https://app.sendgrid.com/settings/api_keys
   - Click "Create API Key"
   - Name: "Neram Production"
   - Permissions: "Restricted Access" → Enable "Mail Send"
   - Copy the key (you won't see it again!)

2. **Verify Sender Email**

   - Go to: https://app.sendgrid.com/settings/sender_auth
   - Click "Single Sender Verification"
   - Add: `noreply@neramclasses.com`
   - Check your email and click verify link

3. **Add API Key to Vercel**

   - Vercel Dashboard → Settings → Environment Variables
   - Add `SMTP_PASS` = `<your-new-api-key>`
   - Environment: Production
   - Click Save

4. **Redeploy**
   - Trigger a new deployment
   - Wait for build to complete
   - Test with `/api/test-email`

---

## 🔍 Check Logs

View production logs:

```bash
vercel logs --prod --follow
```

Look for:

- `[email] SMTP Configuration:`
- `[email] Email sent successfully:`
- Any error messages

---

## ⚠️ Common Mistakes

| Mistake                        | How to Fix                                         |
| ------------------------------ | -------------------------------------------------- |
| Using localhost URL            | Set `NEXT_PUBLIC_APP_URL=https://neramclasses.com` |
| Wrong SendGrid key             | Generate NEW production key in SendGrid            |
| Email not verified             | Verify `noreply@neramclasses.com` in SendGrid      |
| Forgot to redeploy             | Click "Redeploy" after setting variables           |
| Variables in wrong environment | Ensure variables are set for "Production"          |

---

## 🎯 TL;DR

1. Set `NEXT_PUBLIC_APP_URL=https://neramclasses.com` in Vercel
2. Set `SMTP_PASS=<sendgrid-api-key>` in Vercel
3. Verify `noreply@neramclasses.com` in SendGrid
4. Redeploy application
5. Test: `https://neramclasses.com/api/test-email`

---

## 📚 More Help

See full guide: `PRODUCTION_ENVIRONMENT_SETUP.md`
