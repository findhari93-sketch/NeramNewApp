LinkedIn OAuth setup

This project includes a minimal LinkedIn OAuth server callback and session handling.

Required server environment variables (add to your .env.local):

- LINKEDIN_CLIENT_ID
- LINKEDIN_CLIENT_SECRET
- SESSION_SECRET (random string used to sign session tokens)

How it works

1. Client initiates LinkedIn OAuth and redirects user to LinkedIn with redirect_uri set to /api/auth/linkedin/callback.
2. LinkedIn sends back a `code` to /api/auth/linkedin/callback.
3. Server exchanges code for access token, fetches profile and email, upserts into Supabase `users` table and stores access token and expiry.
4. Server issues a signed session cookie `neram_session` (HMAC-SHA256) and redirects back to `/auth/login?linkedin=success`.
5. Client can call `/api/session` to read the signed session cookie, validate it and fetch the user from Supabase.

Notes

- For production you should store tokens securely and issue proper session cookies (HTTP-only, secure, SameSite) and consider rotating refresh tokens.
- LinkedIn requires your app's redirect URI to be configured in the LinkedIn Developer dashboard.
- This is a minimal implementation for testing and will need hardening for production.
