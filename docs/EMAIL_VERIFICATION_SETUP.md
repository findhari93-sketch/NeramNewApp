# Email Verification Setup - Neram Classes

## Overview

This document explains how to set up branded email verification for Neram Classes. The system sends professional, branded verification emails from `noreply@neramclasses.com` instead of Firebase's default generic emails.

## Features

✅ **Branded Sender**: Emails sent from `noreply@neramclasses.com`
✅ **Professional Template**: HTML email with Neram logo, colors, and branding
✅ **Personalized Greeting**: Extracts student name from email (e.g., harrybabu93@gmail.com → "Hi Harrybabu93")
✅ **Button CTA**: Professional "Verify Email Address" button instead of plain link
✅ **48-Hour Expiry**: Link expires after 48 hours with clear notice
✅ **Fallback Link**: Copy-paste option if button doesn't work
✅ **Feature Highlights**: Lists benefits of verifying email
✅ **Mobile Responsive**: Looks great on all devices

## Email Template Preview

### Visual Design
- **Header**: Gradient background (Purple #88206D → Pink #FF105E) with Neram logo
- **Content**: White background with branded colors
- **CTA Button**: Gradient button with hover effect
- **Features Box**: Highlighted benefits with yellow (#FFFB01) accent
- **Footer**: Social links, copyright, and privacy policy

### Email Copy
```
Hi {StudentName},

Thanks for creating a neramclasses.com account!

Confirming your account will give you full access to neramclasses.com - India's No. 1 AI-powered
Architecture entrance exam learning app features, and all future notifications will be sent to
{email}.

To continue, verify your email address by clicking the button below:

[Verify Email Address Button]

⏰ This link is valid for the next 48 hours.

What you'll get access to:
- AI-powered personalized learning paths
- Comprehensive NATA & B.Arch entrance exam preparation
- Interactive practice tests and mock exams
- Expert-curated study materials and video lessons
- Real-time progress tracking and analytics
- Community support and doubt resolution
```

## Technical Architecture

### Components

1. **Email Template** (`src/lib/emailTemplates/verificationEmail.ts`)
   - `generateVerificationEmailHTML()` - Branded HTML template
   - `generateVerificationEmailText()` - Plain text fallback

2. **API Endpoint** (`src/app/api/auth/send-verification-email/route.ts`)
   - Generates Firebase email verification link using Admin SDK
   - Extracts student name from email
   - Sends email via Nodemailer with branded template

3. **Login Integration** (`src/app/auth/login/page.tsx`)
   - Calls custom endpoint after user signup
   - Fallback to Firebase default if custom email fails

4. **Action Handler** (`src/app/auth/action/page.tsx`)
   - Processes verification links (already exists)
   - Handles `mode=verifyEmail&oobCode=...` parameters

### Flow Diagram

```
User Signs Up
     ↓
Firebase creates account
     ↓
Login page calls /api/auth/send-verification-email
     ↓
API generates Firebase verification link (48h expiry)
     ↓
API extracts student name from email
     ↓
API sends branded HTML email via Nodemailer
     ↓
User receives email from noreply@neramclasses.com
     ↓
User clicks "Verify Email Address" button
     ↓
Redirects to /auth/action?mode=verifyEmail&oobCode=...
     ↓
Firebase verifies email
     ↓
User redirected to login with success message
```

## Environment Variables Required

Add these to your `.env.local` file:

### Email SMTP Configuration
```bash
# SMTP Server (Office 365/Outlook example)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@neramclasses.com
SMTP_PASS=your_email_password

# Email Sender Address
MAIL_FROM=noreply@neramclasses.com
FROM_EMAIL=noreply@neramclasses.com

# App URL for verification links
NEXT_PUBLIC_APP_URL=https://neramclasses.com
```

### Alternative: Using Microsoft 365 / Azure
If you have Microsoft 365 or Azure:
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@neramclasses.com
SMTP_PASS=your_microsoft_password
```

### Alternative: Using SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
MAIL_FROM=noreply@neramclasses.com
```

### Alternative: Using Gmail (Not Recommended for Production)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password  # Use App Password, not regular password
MAIL_FROM=noreply@neramclasses.com
```

## Setup Instructions

### 1. Configure Email Domain

#### Option A: Use Existing Microsoft 365 Email
If you already have `noreply@neramclasses.com` in Microsoft 365:

1. Get the email password or create an app-specific password
2. Update `.env.local` with SMTP credentials
3. Done! Emails will be sent from your Microsoft 365 account

#### Option B: Set Up New Email Account

1. **Purchase neramclasses.com domain** (if not already owned)
2. **Choose email provider**:
   - Microsoft 365 Business (Recommended)
   - Google Workspace
   - SendGrid (transactional emails only)
   - Mailgun
   - Amazon SES

3. **Create email account**: `noreply@neramclasses.com`

4. **Get SMTP credentials** from your provider

5. **Update environment variables** in `.env.local`

### 2. Test Email Sending Locally

1. Add SMTP credentials to `.env.local`
2. Start development server: `npm run dev`
3. Sign up with a test email
4. Check if email arrives with branded template

### 3. Verify Email Template

The email should:
- ✅ Show Neram Classes logo
- ✅ Have gradient header (purple to pink)
- ✅ Display student name extracted from email
- ✅ Show "Verify Email Address" button
- ✅ Include 48-hour expiry notice
- ✅ List feature benefits
- ✅ Have working verification link

### 4. Deploy to Production

1. Add environment variables to your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment

2. Add all SMTP variables from `.env.local.example`

3. Set `NEXT_PUBLIC_APP_URL=https://neramclasses.com`

4. Redeploy application

5. Test signup on production

## Troubleshooting

### Email Not Sending

**Check 1: SMTP Credentials**
```bash
# Verify in .env.local
SMTP_HOST=smtp.office365.com  # Correct host?
SMTP_USER=noreply@neramclasses.com  # Correct email?
SMTP_PASS=***  # Correct password?
```

**Check 2: Firewall/Port Blocking**
- Port 587 must be open for SMTP
- Some ISPs block port 587
- Try port 465 with `SMTP_SECURE=true`

**Check 3: App Password (Gmail/Microsoft)**
- Gmail requires App Password (not regular password)
- Microsoft 365 may require Modern Auth

**Check 4: Check API Logs**
```bash
# Check server logs for errors
npm run dev
# Look for "[send-verification-email] Email sent to..."
```

### Email Goes to Spam

**Fix 1: SPF Record**
Add SPF record to your domain DNS:
```
v=spf1 include:spf.protection.outlook.com -all
```

**Fix 2: DKIM**
Enable DKIM signing in your email provider

**Fix 3: DMARC**
Add DMARC record:
```
v=DMARC1; p=quarantine; rua=mailto:admin@neramclasses.com
```

### Link Not Working

**Check 1: Firebase Action Handler**
- Verify `/auth/action` page exists
- Check that it processes `oobCode` parameter

**Check 2: App URL**
```bash
# Verify in .env.local
NEXT_PUBLIC_APP_URL=https://neramclasses.com  # No trailing slash!
```

**Check 3: Firebase Console**
- Go to Firebase Console → Authentication → Templates
- Check "Customize action URL" points to your domain

### Student Name Shows Email Instead

This is expected! The system extracts the part before @ symbol:
- `harrybabu93@gmail.com` → "Harrybabu93"
- `john.doe@example.com` → "John.doe"

To use real student names:
1. Update signup form to ask for name
2. Pass `studentName` to `/api/auth/send-verification-email`
3. Store name in Supabase during signup

## Customization

### Change Email Colors

Edit `src/lib/emailTemplates/verificationEmail.ts`:
```typescript
// Header gradient
background: linear-gradient(135deg, #88206D 0%, #FF105E 100%);

// Button gradient
background: linear-gradient(135deg, #FF105E 0%, #88206D 100%);

// Highlight yellow
background-color: #FFFB01;
```

### Change Logo

Replace logo URL in template:
```html
<img src="https://neramclasses.com/brand/neramclasses-logo.svg" alt="Neram Classes" />
```

### Change Email Copy

Edit text in `generateVerificationEmailHTML()` and `generateVerificationEmailText()`

### Change Link Expiry

Edit API endpoint:
```typescript
// Default is 48 hours (Firebase default)
// To change, you'd need to use custom token system
```

## Security Considerations

1. **Never commit `.env.local`** - Contains sensitive SMTP credentials
2. **Use app-specific passwords** - Don't use your main email password
3. **Enable 2FA** - On email account used for SMTP
4. **Rate limit endpoint** - Prevent abuse of email sending
5. **Validate email addresses** - Prevent sending to invalid emails

## API Reference

### POST /api/auth/send-verification-email

Send branded verification email to a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "studentName": "John" // Optional, extracted from email if not provided
}
```

**Response (Success):**
```json
{
  "ok": true,
  "message": "Verification email sent successfully"
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "User not found"
}
```

**Status Codes:**
- 200: Email sent successfully
- 400: Invalid input or email already verified
- 404: User not found in Firebase
- 500: Server error or failed to send email

## Files Modified/Created

### New Files
- `src/lib/emailTemplates/verificationEmail.ts` - Email template
- `src/app/api/auth/send-verification-email/route.ts` - API endpoint
- `docs/EMAIL_VERIFICATION_SETUP.md` - This file

### Modified Files
- `src/app/auth/login/page.tsx` - Updated to use custom endpoint
- `.env.local.example` - Added SMTP configuration

### Existing Files Used
- `src/lib/email.ts` - Nodemailer configuration
- `src/app/auth/action/page.tsx` - Verification link handler

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review server logs for error messages
3. Verify all environment variables are set
4. Test SMTP credentials with a simple email client first

## Future Enhancements

Possible improvements:
- [ ] Add email preview endpoint for testing
- [ ] Support multiple languages
- [ ] Add email analytics tracking
- [ ] Create templates for password reset, welcome emails
- [ ] Add email queueing system for better reliability
- [ ] Implement email delivery status tracking
