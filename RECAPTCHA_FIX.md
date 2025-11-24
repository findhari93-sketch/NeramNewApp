# Fix reCAPTCHA SITE_MISMATCH Error

## Problem
Error: `Firebase: Recaptcha verification failed - SITE_MISMATCH (auth/captcha-check-failed)`

Your reCAPTCHA Enterprise site key is configured for different domains than where you're testing.

## Solution

### Option 1: Add Domains to Existing reCAPTCHA Key

1. Go to Google Cloud Console:
   https://console.cloud.google.com/security/recaptcha?project=neramtypeco

2. Click on your reCAPTCHA site key: `6LeVyrsrAAAAAEC_QxBB7aA0B4tDADXcWoRq8EFs`

3. Click "EDIT" button

4. Under "Domains", add these domains:
   - `localhost`
   - `neramclasses.com`
   - `*.neramclasses.com` (for subdomains)
   - `*.vercel.app` (for Vercel preview deployments)

5. Save changes

### Option 2: Use Firebase reCAPTCHA Instead (Recommended for Development)

Since Enterprise reCAPTCHA is failing, the code already has a fallback to regular Firebase reCAPTCHA.

The regular reCAPTCHA should work automatically without domain restrictions in development.

## Firebase Phone Auth Quota Issue

### Check Your Quota

1. Go to: https://console.firebase.google.com/project/neramtypeco/usage
2. Check "Authentication" → "Phone Sign-In"
3. **Spark (Free) Plan**: 10 SMS/day
4. **Blaze (Pay-as-you-go)**: Higher limits

### For Development: Use Test Phone Numbers

1. Go to: https://console.firebase.google.com/project/neramtypeco/authentication/providers

2. Click "Phone" provider

3. Scroll to "Phone numbers for testing"

4. Add test numbers:
   ```
   Phone: +916380194614
   Code: 123456
   ```

5. Save

Now when you test with `+916380194614`, it will accept code `123456` instantly without sending real SMS!

### For Production: Upgrade to Blaze Plan

1. Go to: https://console.firebase.google.com/project/neramtypeco/usage
2. Click "Upgrade to Blaze"
3. This gives you higher SMS quota for production use

## Test the Fix

1. Clear browser cache
2. Try phone auth again with test number `+916380194614`
3. Enter code `123456`
4. You should see: "Welcome to the Neram Classes family! All our app resources you can access freely without any interruption."
