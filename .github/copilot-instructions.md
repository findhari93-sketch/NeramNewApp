# NeramNextApp — Copilot instructions (practical & concise)

Minimal repo knowledge to keep AI agents productive. Reference paths are relative to repo root.

- **Stack & layout**

  - Next.js App Router under `src/app`; routed features live in `(main)/*`. API routes stay in `src/app/api/**` and should remain server-only (no client-side imports).
  - React 19 + MUI 7 + Emotion. Always wrap client shells with `src/app/ThemeRegistry.tsx`; any file touching MUI hooks, contexts, or `next/navigation` must start with `"use client"`.

- **Authentication layers**

  - Client auth = Firebase Web SDK (`src/lib/firebase.ts`). Fetch helpers (`src/lib/apiClient.ts`) attach the ID token and retry once on `invalid_token` responses.
  - Server auth = Firebase Admin + Supabase. Initialize Admin exactly as `src/app/api/users/upsert/route.ts` does (JSON blob first, fall back to discrete env vars with `\n`-restored private key). Never import `supabaseServer` outside server code.
  - `src/app/components/shared/ProfileGuard.tsx` wraps the entire app: it pings `/api/session`, forces phone collection via `/api/users/upsert`, and calls `clearAllAuthCaches` + `signOut` if the session API returns 404 (user deleted). Don’t break this handshake.

- **User data model**

  - `users_duplicate` stores grouped JSONB (`account`, `basic`, `contact`, `about_user`, `education`, `application_details`). Always map using `mapToUsersDuplicate`, merge via `mergeUsersDuplicateUpdate`, and respond with the flattened object from `mapFromUsersDuplicate`.
  - `/api/users/upsert` is canonical: verify Firebase token, look up by `firebase_uid` → phone → email, merge updates (never drop `created_at_tz`), and preserve one-way flags like `providers[]` or `phone_auth_used`.
  - Realtime sync (`src/hooks/useSyncedUser.ts`) caches rows under `user-cache:<id>`, listens to Supabase channels, and immediately signs the user out if their row disappears. Respect that behavior when changing schema fields or cache keys.

- **Session + middleware contracts**

  - `/api/session` only trusts a Firebase Bearer token, checks `users` table (not `users_duplicate`), and intentionally returns 404 to signal “user deleted” so `ProfileGuard` can log the person out.
  - `src/middleware.ts` guards `/dashboard/**` by verifying an HMAC’d `neram_session` cookie (secret = `SESSION_SECRET`). Update both `protectedPaths` and `config.matcher` if you add new protected sections.

- **Payments & tokens**

  - Payment links run through `/pay` (see `src/app/(main)/pay/page.tsx`). Query param `v` is a JWT created by admin tools and decoded client-side only for UX; the server re-verifies using `verifyPaymentTokenServer` (`PAYMENT_TOKEN_SECRET` required).
  - `/api/payments/razorpay/create-order` supports three flows: signed JWT tokens, legacy DB tokens (looked up inside `application_details.final_fee_payment`), or direct authenticated amounts when `ALLOW_UNAUTH_RAZORPAY` is false. Always persist `razorpay_order_id` back onto the application row.
  - `/api/payments/razorpay/webhook` is the source of truth. It requires the raw body for HMAC verification, searches `users_duplicate.application_details.final_fee_payment.razorpay_order_id`, appends to `payment_history`, and is fully idempotent. Use `npm run test:webhook` + `scripts/test-webhook.mjs` with ngrok to simulate events (details live in `RAZORPAY_IMPLEMENTATION_SUMMARY.md` and `RAZORPAY_WEBHOOK_SETUP.md`).

- **Client patterns & helpers**

  - Use `SafeSearchParams` (`src/components/SafeSearchParams.tsx`) to access query params inside client components without Suspense churn.
  - `src/lib/clearAuthCache.ts` nukes every local auth artifact (localStorage, sessionStorage, IndexedDB, SW caches). Call it before forced sign-outs or when handling deleted accounts.
  - Avatar URLs, uploads, or other Supabase Storage actions belong in server routes (see `src/app/api/avatar-url` and `src/lib/uploadAvatar.ts` for precedent).

- **Tooling & commands**

  - `npm run dev | build | start | lint | typecheck | test` follow standard meanings; `npm run format` uses Prettier. Payment debugging relies on `npm run test:webhook`.
  - Scripts in `scripts/*.mjs` (database, migrations, webhook) assume Node ESM; run them with `node` or the npm alias.

- **Environment checklist**
  - Core: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Firebase: either `FIREBASE_SERVICE_ACCOUNT_JSON` or (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` with literal newlines). Client keys live under `NEXT_PUBLIC_FIREBASE_*`.
  - Sessions & UI: `SESSION_SECRET`, `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`.
  - Payments: `PAYMENT_TOKEN_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, optional `ALLOW_UNAUTH_RAZORPAY`.
  - Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.

Need more color on any section (e.g., merging rules or Razorpay flows)? Ask and specify the file/feature so we can expand the playbook.
