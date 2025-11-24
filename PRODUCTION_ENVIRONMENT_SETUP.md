# Production Environment Setup Guide

## Critical Issue: SendGrid Emails Not Working in Production

### Root Cause Analysis

Emails work in development but fail in production due to **missing or incorrect environment variables** in your deployment platform (Vercel/other).

---

## ✅ Required Environment Variables for Production

### 1. **SendGrid / SMTP Configuration**

```bash
# SendGrid SMTP Settings
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<YOUR_PRODUCTION_SENDGRID_API_KEY>

# Email From Address (must be verified in SendGrid)
MAIL_FROM=noreply@neramclasses.com
FROM_EMAIL=noreply@neramclasses.com
```

**⚠️ CRITICAL:**

- Use a **production SendGrid API key**, not your development key
- The API key must have "Mail Send" permission enabled
- `MAIL_FROM` email must be verified in SendGrid dashboard

---

### 2. **Application URL**

```bash
# ❌ WRONG (current issue)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ✅ CORRECT for production
NEXT_PUBLIC_APP_URL=https://neramclasses.com
```

**Why it matters:**

- Email verification links use this URL
- If set to localhost, users can't verify from production emails

---

### 3. **Complete Production Environment Variables**

Add these to your Vercel/deployment platform:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjz9ZnLaAbd-57VrPsPmMjVqjUHe3vkdo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=neramtypeco.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=neramtypeco
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=neramtypeco.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=253536076108
NEXT_PUBLIC_FIREBASE_APP_ID=1:253536076108:web:7880c8a503853101d88fe9

# Firebase Admin (use one of these methods)
# Method 1: Full JSON (recommended for Vercel)
FIREBASE_SERVICE_ACCOUNT_JSON=<paste entire JSON from Firebase Console>

# Method 2: Individual fields (if JSON doesn't work)
FIREBASE_PROJECT_ID=neramtypeco
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@neramtypeco.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n<your key>\n-----END PRIVATE KEY-----\n

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hgxjavrsrvpihqrpezdh.supabase.co
SUPABASE_URL=https://hgxjavrsrvpihqrpezdh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>

# Security
SESSION_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
PAYMENT_TOKEN_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">

# Razorpay (use LIVE keys for production)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_SECRET=<your live secret>
RAZORPAY_WEBHOOK_SECRET=<your webhook secret>
NEXT_PUBLIC_UPI_VPA=neramclassroom-1@okhdfcbank

# SendGrid (PRODUCTION)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.XXXXXXXXXXXXXXXXXXXXX  # ← Generate NEW production API key
MAIL_FROM=noreply@neramclasses.com

# Application URL (PRODUCTION)
NEXT_PUBLIC_APP_URL=https://neramclasses.com  # ← FIX THIS!

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=6LeVyrsrAAAAAEC_QxBB7aA0B4tDADXcWoRq8EFs

# Admin Access
ADMIN_ALLOWED_EMAILS=nexus-admin@neram.co.in

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyBDUAB75fl7qWRkIJcrTcUQoC2x1SxmFKI
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UCWbr9w9lW1XzN4ldp3sMCRw

# Tawk.to Chat
NEXT_PUBLIC_TAWK_PROPERTY_ID=6041bc2a1c1c2a130d652337
NEXT_PUBLIC_TAWK_WIDGET_ID=1f00ce2gr
```

---

## 🔧 How to Set Environment Variables in Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: `NeramNewApp`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `SMTP_PASS`)
   - **Value**: Variable value
   - **Environments**: Select **Production** (and optionally Preview/Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set individual variables
vercel env add SMTP_PASS production
# Paste your SendGrid API key when prompted

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://neramclasses.com

# Pull environment variables locally (to verify)
vercel env pull .env.production
```

### Option 3: Import from .env file

```bash
# Create a production.env file with all variables
# Then import via Vercel CLI
vercel env pull production
```

---

## 🧪 Testing Email in Production

### Step 1: Create a Test Endpoint

Create `src/app/api/test-email/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";

export async function GET() {
  try {
    const result = await sendMail({
      to: "your-test-email@example.com", // Replace with your email
      subject: "Production Email Test",
      text: "This is a test email from production",
      html: "<h1>Test Email</h1><p>If you see this, SendGrid is working!</p>",
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      response: result.response,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        MAIL_FROM: process.env.MAIL_FROM,
        hasSmtpPass: !!process.env.SMTP_PASS,
        passLength: process.env.SMTP_PASS?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
```

### Step 2: Test the Endpoint

Visit: `https://neramclasses.com/api/test-email`

**Expected Success Response:**

```json
{
  "success": true,
  "messageId": "...",
  "environment": {
    "SMTP_HOST": "smtp.sendgrid.net",
    "hasSmtpPass": true
  }
}
```

**If it fails, check the error message for details**

---

## 🔍 Debugging Production Email Issues

### Check Production Logs

```bash
# Vercel Logs
vercel logs --prod

# Look for:
# - "[email] SMTP Configuration:"
# - "[email] Failed to send email:"
# - Any error messages
```

### Common Error Messages & Solutions

| Error                                     | Cause                          | Solution                                                 |
| ----------------------------------------- | ------------------------------ | -------------------------------------------------------- |
| `SMTP not configured. Missing: SMTP_PASS` | API key not set in production  | Add `SMTP_PASS` to Vercel environment variables          |
| `Connection timeout`                      | Firewall or wrong port         | Verify `SMTP_PORT=587` and `SMTP_HOST=smtp.sendgrid.net` |
| `Invalid API key`                         | Wrong or expired key           | Generate new SendGrid API key                            |
| `Sender address rejected`                 | Email not verified in SendGrid | Verify `noreply@neramclasses.com` in SendGrid dashboard  |
| `550 Unauthenticated`                     | Wrong username                 | Ensure `SMTP_USER=apikey` (literal word "apikey")        |

---

## 📋 SendGrid Domain Authentication Setup

### Why You Need This

SendGrid requires domain authentication for production emails to:

- Improve deliverability
- Avoid spam filters
- Increase trust with email providers

### Setup Steps

1. **Login to SendGrid Dashboard**

   - Go to: https://app.sendgrid.com
   - Navigate to: **Settings** → **Sender Authentication**

2. **Authenticate Your Domain**

   - Click **Authenticate Your Domain**
   - Select your DNS provider (e.g., GoDaddy, Cloudflare)
   - Enter your domain: `neramclasses.com`
   - Follow the instructions to add DNS records

3. **DNS Records to Add**

   SendGrid will provide records like:

   ```
   Type: CNAME
   Name: em1234.neramclasses.com
   Value: u1234567.wl123.sendgrid.net

   Type: CNAME
   Name: s1._domainkey.neramclasses.com
   Value: s1.domainkey.u1234567.wl123.sendgrid.net

   Type: CNAME
   Name: s2._domainkey.neramclasses.com
   Value: s2.domainkey.u1234567.wl123.sendgrid.net
   ```

4. **Verify Authentication**
   - Wait 24-48 hours for DNS propagation
   - Click **Verify** in SendGrid dashboard
   - Status should change to "Verified"

### Alternative: Single Sender Verification (Quick Fix)

If you can't set up domain authentication immediately:

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Add email: `noreply@neramclasses.com`
3. Check your inbox for verification email
4. Click the link to verify

---

## ✅ Final Checklist

Before deploying to production, verify:

- [ ] SendGrid API key is generated for production (not test)
- [ ] `SMTP_PASS` is set in Vercel environment variables
- [ ] `NEXT_PUBLIC_APP_URL=https://neramclasses.com` (not localhost)
- [ ] `MAIL_FROM=noreply@neramclasses.com` is verified in SendGrid
- [ ] Domain authentication is complete (or single sender verified)
- [ ] Razorpay keys are LIVE keys (not test keys)
- [ ] `SESSION_SECRET` and `PAYMENT_TOKEN_SECRET` are set
- [ ] Test email endpoint works: `/api/test-email`
- [ ] Production logs show no SMTP errors
- [ ] Redeploy after setting all variables

---

## 🚀 Deployment Steps

1. **Set all environment variables** in Vercel dashboard
2. **Verify domain** in SendGrid
3. **Test email endpoint** works
4. **Trigger new deployment**:
   ```bash
   git commit -m "Fix production email configuration"
   git push origin master
   ```
5. **Monitor logs** for any errors:
   ```bash
   vercel logs --prod --follow
   ```

---

## 📞 Support

If emails still don't work after following this guide:

1. Check Vercel logs for specific error messages
2. Verify SendGrid Activity Feed: https://app.sendgrid.com/email_activity
3. Test with the `/api/test-email` endpoint
4. Check that all environment variables are set correctly

**SendGrid Support**: https://support.sendgrid.com

---

## Additional Notes

### Development vs Production

- **Development** (`.env.local`):

  - Uses test SendGrid API key
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
  - Test Razorpay keys

- **Production** (Vercel):
  - Uses production SendGrid API key
  - `NEXT_PUBLIC_APP_URL=https://neramclasses.com`
  - Live Razorpay keys
  - Domain must be verified in SendGrid

### Security Best Practices

- Never commit API keys to Git
- Rotate API keys regularly
- Use separate keys for development and production
- Restrict API key permissions to only what's needed
- Monitor SendGrid activity for suspicious usage
