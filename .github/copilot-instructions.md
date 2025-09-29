# Copilot Project Instructions

Short, repo-specific guidance for AI coding agents. Favor these concrete patterns over boilerplate.

## Stack and layout

- Next.js App Router in `src/app` (Next 15). API routes under `src/app/api/**`.
- React 19 + MUI 7 + Emotion. Theme/provider is a client component: `src/app/ThemeRegistry.tsx`.
- Data/auth: Firebase Auth on the client; Supabase (Postgres + Storage) as the primary store. Server/service-role client lives in `src/lib/supabaseServer.ts`; client anon in `src/lib/supabase.ts`.
- Single main table: `public.users` (migrations in `supabase_migrations/**`, types in `src/types/db.ts`). Flexible fields live in `users.profile` and stepwise form data in `users.application` JSON.

## Auth and data flow

- Client obtains a Firebase ID token; API routes verify with Firebase Admin before reading/writing `users`. Primary key is `firebase_uid` with fallbacks to `phone` then `email`.
- All profile/application writes go through `POST /api/users/upsert` and return `{ ok, error?, user? }`.
  - Normalizes inputs: camelCase→snake_case, `username` lowercasing, gender enum to allowed values, and academic-year labels (e.g. `2025-26`).
  - Merges JSON safely: preserves existing `profile` and `application` fields instead of replacing.
  - Never overwrite `student_name` with empty; strips unknown columns and retries to avoid Postgres “column does not exist”.
  - Tracks `providers[]` and preserves `phone_auth_used` once true.
- Client helper `src/lib/apiClient.ts` auto-attaches `Authorization: Bearer <token>` and retries once on `{ status: 401, error: "invalid_token" }`.

## Client vs server rules

- Any component using MUI components/hooks, Emotion, React context, or `next/navigation` must start with `"use client"` (e.g., many under `src/app/components/**`).
- Never import `lib/supabaseServer` on the client; use `lib/supabase.ts` on the client and `lib/supabaseServer.ts` on the server.
- If a page uses `useSearchParams()` or `useRouter()`, wrap it in `<Suspense>` (see `src/app/auth/login/page.tsx`).

## API patterns and examples

- Read-only routes return specific shapes (e.g., `GET /api/avatar-url` → `{ signedUrl }` or `204 No Content`).
- Minimal secure write snippet:
  ```ts
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = await admin.auth().verifyIdToken(token!);
  const { data, error } = await supabaseServer
    .from("users")
    .update({ last_sign_in: new Date().toISOString() })
    .eq("firebase_uid", decoded.uid)
    .select()
    .maybeSingle();
  ```
  See `src/app/api/users/upsert/route.ts` for normalization and merge patterns.

## Realtime, caching, sessions

- Local cache keys are prefixed `user-cache:` with TTL logic (`src/lib/userCache.ts`; tests in `src/lib/__tests__/user-cache.test.ts`).
- Realtime hook `src/hooks/useSyncedUser.ts` subscribes with a column filter; align the filter with actual schema (`id` or `firebase_uid`). Its current `uuid` filter is likely incorrect.
- `src/middleware.ts` guards `/dashboard/*` via an HMAC-signed `neram_session` cookie (`SESSION_SECRET`). Reuse `validateSessionCookie` and extend `config.matcher` for new protected areas.

## Avatars and storage

- `GET /api/avatar-url` checks `users.avatar_path`, then legacy `profiles.avatar_path`, then signs a URL from bucket `avatars` using the service-role client.

## Environment and dev workflow

- Required envs (examples): Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), Firebase client (`NEXT_PUBLIC_FIREBASE_*`), and Firebase Admin either via `FIREBASE_SERVICE_ACCOUNT_JSON` or discrete vars (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test` (Jest + ts-jest, jsdom). Tests live under `src/**/__tests__/**`.
- Windows gotchas: keep import path casing consistent and avoid absolute filesystem import paths—use relative imports (fix `src/app/api/avatar-url/route.ts`).

## Files to study first

- `src/app/api/users/upsert/route.ts` (trusted normalization/merge logic).
- `src/lib/apiClient.ts`, `src/lib/supabaseServer.ts`, `src/lib/supabase.ts`.
- `src/middleware.ts`, `src/types/db.ts`, migrations in `supabase_migrations/**`.
