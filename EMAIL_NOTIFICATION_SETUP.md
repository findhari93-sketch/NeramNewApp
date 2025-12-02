# Email Notification System - Setup Guide

## Overview

The payment system sends automated emails for:
1. **Student Invoice Emails** - Sent to customers after successful payment with PDF invoice attached
2. **Admin Notification Emails** - Sent to admin team when payment is received

## Required Environment Variables

### Microsoft Azure AD (for sending emails via Microsoft Graph API)

```env
# Azure AD Application Credentials
AZ_TENANT_ID=your-tenant-id
AZ_CLIENT_ID=your-client-id
AZ_CLIENT_SECRET=your-client-secret

# Email sender account (must be a valid Microsoft 365 account)
AZ_SENDER_USER=noreply@yourdomain.com

# Support/Help Desk Email (used in email footers and BCC)
HELP_DESK_EMAIL=support@yourdomain.com

# Admin Email Addresses (comma-separated list for payment notifications)
ADMIN_EMAILS=admin1@yourdomain.com,admin2@yourdomain.com,admin3@yourdomain.com
```

### Alternative: Use HELP_DESK_EMAIL as fallback
If `ADMIN_EMAILS` is not set, the system will use `HELP_DESK_EMAIL` as the admin notification recipient.

## Setting Up Azure AD for Email Sending

### Step 1: Register Application in Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Name your app (e.g., "Neram Email Service")
5. Select **Accounts in this organizational directory only**
6. Click **Register**

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph** > **Application permissions**
3. Add the following permission:
   - `Mail.Send` - Send mail as any user
4. Click **Grant admin consent** for your organization

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and select expiration period
4. Click **Add**
5. **Copy the secret value immediately** (you won't be able to see it again)
6. Save this as `AZ_CLIENT_SECRET` in your environment variables

### Step 4: Get Application IDs

1. Go to **Overview** page of your app registration
2. Copy the following values:
   - **Application (client) ID** → `AZ_CLIENT_ID`
   - **Directory (tenant) ID** → `AZ_TENANT_ID`

### Step 5: Configure Sender Email

1. `AZ_SENDER_USER` should be a valid email address from your Microsoft 365 organization
2. The app will send emails on behalf of this user
3. Make sure this email account exists and is active

## Vercel Deployment

### Adding Environment Variables to Vercel

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add all the required variables listed above
5. Make sure to add them for **Production**, **Preview**, and **Development** environments

### Important Notes for Vercel

- Environment variables must be set in Vercel dashboard, not just in `.env.local`
- After adding new environment variables, redeploy your application
- Check Vercel Function Logs to debug any email sending issues

## Testing Email Functionality

### Local Testing

1. Ensure all environment variables are set in `.env.local`
2. Start your development server: `npm run dev`
3. Make a test payment
4. Check console logs for email sending status:
   - `[verify] ✅ Invoice email sent successfully to user@example.com`
   - `[verify] ✅ Admin email notification sent successfully`
   - `[Admin Email] ✅ Admin notification sent to 2 recipient(s): admin1@domain.com, admin2@domain.com`

### Debugging Email Issues

Check the logs for these error messages:

**Graph Token Issues:**
```
[Email Service] Azure AD credentials not configured
[verify] ❌ Failed to get Graph token
```
**Solution:** Verify `AZ_TENANT_ID`, `AZ_CLIENT_ID`, and `AZ_CLIENT_SECRET` are set correctly

**Sender Configuration Issues:**
```
AZ_SENDER_USER not configured
```
**Solution:** Add `AZ_SENDER_USER` environment variable

**Admin Email Not Configured:**
```
[Admin Email] No admin emails configured (ADMIN_EMAILS or HELP_DESK_EMAIL)
```
**Solution:** Add `ADMIN_EMAILS` or ensure `HELP_DESK_EMAIL` is set

**Missing Student Email:**
```
[verify] ❌ No email address found for student - invoice not sent
```
**Solution:** Ensure student email is captured in the application form

## Email Templates

### Student Invoice Email
- **Subject:** Payment Invoice - INV-YYYY-NNNNNN
- **Includes:**
  - Payment confirmation
  - Invoice PDF attachment
  - Payment details
  - Next steps for course access
  - Support contact information

### Admin Notification Email
- **Subject:** New Payment Received: ₹X,XXX - Student Name
- **Includes:**
  - Student details (name, email)
  - Course information
  - Payment amount and method
  - Payment IDs for reference
  - Links to view application and all applications

## Email Flow

```
Payment Success
    ↓
    ├─→ Verify Payment (verify/route.ts)
    │   ├─→ Generate Invoice PDF
    │   ├─→ Send Invoice to Student Email
    │   ├─→ Send Admin Notification Email
    │   └─→ Store invoice in Supabase storage
    │
    └─→ Webhook (webhook/route.ts)
        ├─→ Generate Invoice PDF
        ├─→ Send Invoice to Student Email
        └─→ Send Admin Notification Email
```

## Troubleshooting

### Emails Not Being Sent in Production

1. **Check Vercel Environment Variables**
   - All Azure AD variables must be set in Vercel
   - Verify spelling and correct values

2. **Check Vercel Function Logs**
   - Go to Vercel Dashboard > Your Project > Deployments
   - Click on the latest deployment
   - Go to "Functions" tab
   - Check logs for `/api/payments/razorpay/verify` and `/api/payments/razorpay/webhook`

3. **Verify Azure AD Permissions**
   - Ensure `Mail.Send` permission is granted
   - Admin consent must be provided

4. **Check Microsoft 365 Sender Account**
   - Account must be active
   - Account must have a valid license

### Student Not Receiving Emails

1. **Check Spam/Junk Folder**
2. **Verify Email Address**
   - Check if email was captured correctly in application
   - Look for typos in email address
3. **Check Application Data**
   - Email might be in `application.email` or `application.contact.email`

### Admin Not Receiving Notifications

1. **Verify ADMIN_EMAILS is Set**
   ```bash
   # In Vercel, check if ADMIN_EMAILS is configured
   ```
2. **Check Email Format**
   - Ensure comma-separated, no extra spaces
   - Example: `admin1@domain.com,admin2@domain.com`
3. **Check Logs for Success Message**
   ```
   [Admin Email] ✅ Admin notification sent to X recipient(s)
   ```

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Rotate client secrets periodically** (recommended: every 6 months)
3. **Use separate Azure AD apps for production and development**
4. **Monitor email sending logs for suspicious activity**
5. **Keep HELP_DESK_EMAIL and ADMIN_EMAILS updated** when team changes

## Support

For issues or questions:
- Check Vercel function logs
- Review Azure AD app configuration
- Contact: support@neram.co.in
