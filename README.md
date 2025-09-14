This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Supabase schema

- SQL migrations live in `supabase_migrations/`.
- Apply them in your Supabase project by pasting the SQL into the SQL editor in the Dashboard (in order), or use the Supabase CLI if configured.
- **Important**: Run migration `010_add_username_email_auth.sql` to add username and email columns with unique constraints.
- Make sure `public.users` has these columns used by the app:
  - id text PRIMARY KEY (default gen_random_uuid())
  - firebase_uid text UNIQUE
  - phone text UNIQUE
  - email text UNIQUE
  - username text (case-insensitive unique via index)
  - student_name text, profile jsonb, application jsonb, etc.

### Firebase Setup for Email/Password Authentication

1. **Enable Email/Password Provider** in Firebase Console:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password" provider
   - Optionally enable "Email link (passwordless sign-in)" if desired

2. **Enable Phone Authentication** (already configured):
   - Phone provider should already be enabled
   - reCAPTCHA Enterprise is configured for phone verification

### Authentication Features

This app supports multiple sign-in methods:

1. **Phone OTP** (existing) - Uses Firebase Phone Auth with reCAPTCHA
2. **Email/Password** (new) - Users can link email/password to existing phone accounts
3. **Username/Password** (new) - Resolves username to email, then uses email/password
4. **Google** (existing) - OAuth with Google
5. **LinkedIn** (existing) - OAuth with LinkedIn

#### Username Login Flow

- Users can set a unique username in Account Settings
- During login, usernames are resolved to email addresses via `/api/auth/username-to-email`
- Username resolution is rate-limited and validates against reserved names
- Usernames are case-insensitive and support: `a-z`, `0-9`, `_`, `.`

#### Account Management Features

Navigate to `/account` to access:
- Link email/password to existing phone account
- Email verification (send/resend)
- Change password (with re-authentication)
- Password reset via email
- Set/change username (with availability check)
- View linked sign-in methods

### API Rate Limiting

- Username-to-email lookup: 10 requests/minute per IP
- Username availability check: 30 requests/minute per IP

### Security Notes

- Passwords are stored entirely in Firebase (never in Supabase)
- Username-to-email resolution only returns email for valid usernames
- All password operations require Firebase re-authentication
- Input validation using Zod schemas throughout

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
