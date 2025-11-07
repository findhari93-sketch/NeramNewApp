# NeramNextApp — Copilot instructions (practical & concise)

This file captures the minimal, actionable knowledge an AI coding agent needs to be productive in this repo. Follow examples referenced below.

- Stack & layout

  - Next.js App Router (App directory) under `src/app`. API routes live at `src/app/api/**`.
  - React 19 + MUI 7 + Emotion. Theme provider: `src/app/ThemeRegistry.tsx` (client component using "use client").

- Authentication & data flow (must-follow)

  - Client auth is Firebase (client SDK). Client code obtains a Firebase ID token and calls internal API routes (see `src/lib/apiClient.ts`).
  - Server uses Supabase (Postgres + Storage). Use `src/lib/supabaseServer.ts` only inside server/runtime (API routes, server components). The server client requires SUPABASE_SERVICE_ROLE_KEY and will throw if missing.
  - Data model convention: user data is stored in grouped JSONB columns on `users` / `users_duplicate` (see `supabase_migrations/` and `src/lib/userFieldMapping`). Map/merge JSONB rather than replacing.

- Canonical API pattern (example: `/api/users/upsert`)

  - All profile/application writes should follow `POST /api/users/upsert` behavior: verify Firebase bearer token, resolve firebase_uid → user row, then merge incoming fields into JSONB columns instead of overwriting. See `src/app/api/users/upsert/route.ts` for full logic.
  - Normalization rules used by upsert:
    - Convert camelCase → snake_case when writing to DB.
    - Lowercase `username`.
    - Preserve non-empty `student_name`; do not overwrite with blank values.
    - Preserve `providers[]` array and `phone_auth_used` once true.
  - Authentication expectations: API routes expect Authorization: Bearer <Firebase ID token> and use firebase-admin on the server to verify tokens. The admin SDK is initialized from `FIREBASE_SERVICE_ACCOUNT_JSON` or discrete env vars (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

- Client/server boundaries & rules

  - Any file that uses MUI, Emotion, React context, or Next navigation must start with "use client".
  - Never import `src/lib/supabaseServer.ts` into client code. For server-only actions (signing storage URLs, admin queries), add a server API route and call `supabaseServer` there.
  - Use `src/lib/apiClient.ts` for client → internal API calls: it auto-attaches the Firebase token and retries once if the server returns `invalid_token`.

- Realtime, caching, and helpers

  - Local cache key prefix: `user-cache:` (see `src/lib/userCache.ts`). Use read/write helpers rather than direct localStorage where possible.
  - Realtime subscriptions use Supabase channels around `users_duplicate` (see `src/hooks/useSyncedUser.ts`). Prefer resolving firebase_uid → Supabase id before subscribing.

- Middleware & session protection

  - `src/middleware.ts` protects `/dashboard/*` using an HMAC-signed `neram_session` cookie (signed with `SESSION_SECRET`). If you modify protected paths, update `config.matcher`.

- Storage & avatars

  - Avatar URL endpoint checks `users.avatar_path` then legacy `profiles.avatar_path`, then signs a bucket URL (`avatars`) via `supabaseServer` (search for `avatar` in `src/app/api`).

- Dev / CI commands (from `package.json`)

  - npm run dev — Next dev server
  - npm run build — Next build
  - npm run start — Next start
  - npm run lint — eslint
  - npm run typecheck — tsc --noEmit
  - npm run test — jest (jest + ts-jest)

- Required environment variables (observed patterns)

  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server)
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (client)
  - FIREBASE_SERVICE_ACCOUNT_JSON OR FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (server)
  - SESSION_SECRET for middleware cookie signing

- Quick places to look first (examples)

  - Upsert normalization & merge: `src/app/api/users/upsert/route.ts`
  - Server Supabase client: `src/lib/supabaseServer.ts` (requires service role key)
  - Client API helper: `src/lib/apiClient.ts` (token attach + invalid_token retry)
  - Cache & realtime: `src/lib/userCache.ts`, `src/hooks/useSyncedUser.ts`
  - Theme provider: `src/app/ThemeRegistry.tsx`

- Small contract for new API routes touching users

  - Inputs: JSON payload from authenticated client (Authorization: Bearer <Firebase token>). Accept both camelCase and snake_case.
  - Outputs: { ok: boolean, user?: <flat user>, error?: string }
  - Error modes: 401 for missing/invalid token, 500 for DB errors. Preserve existing fields during merges.

- Edge cases to be mindful of (from code)

  - Firebase admin init: either FIREBASE_SERVICE_ACCOUNT_JSON or discrete env vars (private key must replace \n sequences).
  - Supabase server client throws if SUPABASE_SERVICE_ROLE_KEY is missing — don't run server routes without it.
  - `apiClient` retries once when server returns `invalid_token`; avoid infinite refresh loops.

If anything above is unclear or you want snippets showing the normalization helpers in `src/lib/userFieldMapping`, tell me which area to expand and I’ll iterate.
