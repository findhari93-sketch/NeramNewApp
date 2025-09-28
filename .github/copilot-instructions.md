# Copilot Project Instructions

Short, project-specific guidance for AI coding agents. Favor these patterns over boilerplate.

## Stack and layout

- Next.js App Router in `src/app`. API routes live under `src/app/api/**`.
- React 19 + MUI 7 + Emotion. Theme/provider via client component `src/app/ThemeRegistry.tsx`.
- Data/auth: Firebase on the client, Supabase (Postgres + storage) as primary store. Server/service-role client: `src/lib/supabaseServer.ts`.
- Single table: `public.users` (migrations in `supabase_migrations/**`, types in `src/types/db.ts`). Flexible fields go in `users.profile` and stepwise form data in `users.application` JSON.

## Auth and data flow

- Client fetches a Firebase ID token; API routes verify with Firebase Admin and then read/write `users` keyed by `firebase_uid` (fallback: `phone`/`email`).
- All profile/application writes go through `POST /api/users/upsert`:
  - Normalizes inputs (camelCase→snake_case, username lowercasing, gender enum, academic-year label e.g. `2025-26` for NATA).
  - Merges JSON (`profile`, `application`) safely without dropping existing fields.
  - Never overwrite `student_name` with empty values.
  - Strips unknown columns and retries to avoid Postgres “column does not exist”.
- Client helpers in `src/lib/apiClient.ts` auto-attach `Authorization: Bearer <token>` and refresh on `{ status: 401, error: "invalid_token" }`.

## Client vs server rules (MUI/Emotion)

- Any component using MUI hooks/components, Emotion `styled`, React context, or `next/navigation` hooks must start with `"use client"` (e.g., `ThemeRegistry.tsx`, components under `src/app/components/shared/Footer/**`).
- Do NOT import `lib/supabaseServer` in client code; use `lib/supabase.ts` (anon key) on the client and `lib/supabaseServer.ts` on the server.
- If a page uses `useSearchParams()`/`useRouter()`, wrap it with `<Suspense>` (see `src/app/auth/login/page.tsx`).

## API contracts and examples

- Writes use a standard envelope: `{ ok: boolean, error?: string, ... }` (see `users/upsert`). For read-only routes, match existing shapes (e.g., `avatar-url` returns `{ signedUrl }` or `204 No Content`).
- Minimal secure write pattern inside a route:
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

## Middleware and sessions

- `src/middleware.ts` protects `/dashboard/*` using an HMAC-signed `neram_session` cookie (`SESSION_SECRET`). Reuse `validateSessionCookie` and extend `config.matcher` if adding protected areas.

## Realtime and caching

- Local cache: prefix `user-cache:` with TTL behavior (see `src/lib/userCache.ts` and tests in `src/lib/__tests__/user-cache.test.ts`).
- Realtime sync hook `src/hooks/useSyncedUser.ts` subscribes with a column filter. Ensure the filter matches actual schema (`id` or `firebase_uid`); the hook’s current `uuid` filter may need alignment.

## Avatar handling

- `GET /api/avatar-url` checks `users.avatar_path` then legacy `profiles.avatar_path`, then signs a URL from bucket `avatars` using the service-role client. Current response: `{ signedUrl }` (or `204` when not set).

## Developer workflow

- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test` (Jest + ts-jest, jsdom).
- Windows: keep import path casing consistent and avoid absolute filesystem import paths—use relative imports (see `src/app/api/avatar-url/route.ts`).

## Files to study first

- `src/app/api/users/upsert/route.ts` (normalization/merge patterns, envelope).
- `src/lib/apiClient.ts` (token refresh and retries), `src/lib/supabaseServer.ts` (service-role usage).
- `src/middleware.ts` (session cookie guard), `src/types/db.ts` (users shape), migrations in `supabase_migrations/**`.
