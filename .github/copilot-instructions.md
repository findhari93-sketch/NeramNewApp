# NeramNextApp — Copilot instructions (condensed)

This file gives focused, actionable rules so an AI coding agent can be productive quickly. Follow these repo-specific patterns and check the referenced files for examples.

- Stack & layout:

  - Next.js App Router (Next 15) under `src/app`. API routes live in `src/app/api/**`.
  - React 19 with MUI 7 + Emotion. Theme/provider: `src/app/ThemeRegistry.tsx` (client component).

- Auth & data flow (essential):

  - Client auth: Firebase (client SDK). Client code fetches a Firebase ID token and calls internal API routes.
  - Server data: Supabase (Postgres + Storage). Use `src/lib/supabaseServer.ts` on server only (service-role key). Use `src/lib/supabase.ts` on the client (anon key).
  - Main table: `public.users`. JSON columns used frequently: `users.profile` and `users.application` (see `src/types/db.ts` and `supabase_migrations/`).

- Canonical API pattern:

  - All profile/application writes go through POST `/api/users/upsert` (see `src/app/api/users/upsert/route.ts`). Mirror its normalization/merge logic when creating new endpoints:
    - Normalize input: camelCase → snake_case; lowercase `username`; map enums (gender, academic labels like `2025-26`).
    - Merge JSON columns instead of replacing (preserve existing fields).
    - Don’t overwrite `student_name` with empty values; preserve `providers[]`; keep `phone_auth_used` true once set.

- Client/server rules (must-follow):

  - Any React component using MUI, Emotion, context, or `next/navigation` must start with "use client".
  - Never import `src/lib/supabaseServer.ts` into client code. If you need storage signing or admin actions, add a server API route or use `supabaseServer` inside `src/app/api/**`.
  - Pages using `useSearchParams()` / `useRouter()` wrap their client UI in `<Suspense>` if needed (see `src/app/auth/login/page.tsx`).

- Realtime & caching:

  - Local cache keys prefix: `user-cache:` (see `src/lib/userCache.ts`).
  - Realtime subscription helper: `src/hooks/useSyncedUser.ts` (subscribe using `id` or `firebase_uid`).

- Middleware & sessions:

  - `src/middleware.ts` protects `/dashboard/*` routes using an HMAC-signed `neram_session` cookie (`SESSION_SECRET`). If you protect new paths, update `config.matcher`.

- Storage/avatars:

  - `GET /api/avatar-url` checks `users.avatar_path` then legacy `profiles.avatar_path`, then signs a bucket URL (`avatars`) with `supabaseServer`.

- Dev & CI quick commands (from `package.json`):

  - dev: `npm run dev` (Next dev server)
  - build: `npm run build` (Next build)
  - start: `npm run start` (Next start)
  - lint: `npm run lint`
  - typecheck: `npm run typecheck` (tsc --noEmit)
  - test: `npm run test` (Jest + ts-jest)

- Environment reminders:

  - Required envs: SUPABASE*URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_FIREBASE*\*, and Firebase admin credentials (SERVICE_ACCOUNT JSON or discrete envs).
  - On Windows, keep import path casing exact and prefer relative imports.

- Where to look first (examples):

  - Upsert normalization: `src/app/api/users/upsert/route.ts`
  - API helper: `src/lib/apiClient.ts` (auto-attaches Authorization header, retries on invalid_token)
  - Server/client supabase: `src/lib/supabaseServer.ts`, `src/lib/supabase.ts`
  - Theme/provider: `src/app/ThemeRegistry.tsx`
  - Cache & realtime: `src/lib/userCache.ts`, `src/hooks/useSyncedUser.ts`

- For PRs and changes:
  - Preserve existing normalization/merge semantics when touching user data.
  - Add tests under `src/**/__tests__/**` for new behaviors; run `npm test`.

If any area above is unclear or you want more examples (small code snippets showing the normalization or a sample API route), tell me which part and I’ll add it.
