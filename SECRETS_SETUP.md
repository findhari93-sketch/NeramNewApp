# Secrets Setup Guide

## Overview
This project requires multiple environment secrets for Firebase, Supabase, Razorpay, ReCaptcha, YouTube, and other services. **Never commit real credentials to git.**

## Setup Instructions

### 1. Local Development
Copy `apphosting.sample.yaml` to `apphosting.yaml` and fill in real values:
```powershell
copy apphosting.sample.yaml apphosting.yaml
# Edit apphosting.yaml with your real credentials
```

`apphosting.yaml` is already in `.gitignore` and will not be committed.

### 2. Production/CI Deployment
Use your hosting provider's secret management:
- **Firebase App Hosting**: Use Cloud Secret Manager and reference secrets in `apphosting.yaml`
- **Vercel/Netlify**: Add environment variables in project settings
- **GitHub Actions**: Add secrets in repository settings → Secrets and variables → Actions

### 3. Required Secrets

#### Firebase (Server & Client)
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase web API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` — Firebase sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` — Firebase app ID
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Full service account JSON (server-only)
- `FIREBASE_PROJECT_ID` — Project ID (server)
- `FIREBASE_CLIENT_EMAIL` — Service account email (server)
- `FIREBASE_PRIVATE_KEY` — Service account private key (server)

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_URL` — Supabase project URL (server)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only, never expose to client)

#### Payment (Razorpay)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Razorpay key ID (client)
- `RAZORPAY_KEY_ID` — Razorpay key ID (server)
- `RAZORPAY_KEY_SECRET` — Razorpay secret (server-only)
- `NEXT_RAZORPAY_KEY_SECRET` — Razorpay secret (server)
- `NEXT_PUBLIC_UPI_VPA` — UPI VPA for payment

#### ReCaptcha
- `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` — ReCaptcha site key

#### YouTube
- `NEXT_PUBLIC_YOUTUBE_API_KEY` — YouTube Data API key
- `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` — YouTube channel ID

#### Chat (Tawk.to)
- `NEXT_PUBLIC_TAWK_PROPERTY_ID` — Tawk.to property ID
- `NEXT_PUBLIC_TAWK_WIDGET_ID` — Tawk.to widget ID

### 4. Security Notes
- **Server-only secrets** (service role keys, private keys, secrets) must NEVER be prefixed with `NEXT_PUBLIC_` or exposed to the client.
- Rotate any credentials that were previously committed to git.
- Use `.env.local` for local dev (not tracked by git).
- Use secret managers for production deployments.

### 5. Migration from Committed Secrets
If you previously had secrets in `apphosting.yaml` in git history:
1. Rotate all exposed credentials immediately.
2. Remove secrets from git history using `git-filter-repo` or BFG.
3. Force-push the cleaned branch.
4. Notify collaborators to re-clone or rebase.
