# NeramNextApp Copilot Instructions

> This file guides AI coding agents to be productive in this codebase. It summarizes architecture, data flow, conventions, and critical workflows. **Favor these patterns over generic boilerplate.**

## Architecture & Data Flow

- **Next.js App Router** (Next 15) in `src/app`. API routes: `src/app/api/**`.
- **React 19 + MUI 7 + Emotion**. Theme/provider: `src/app/ThemeRegistry.tsx` (client component).
- **Data/auth:**
  - **Firebase Auth** (client-side): user login, token acquisition.
  - **Supabase (Postgres + Storage):** main data store. Service-role client: `src/lib/supabaseServer.ts` (server only); anon client: `src/lib/supabase.ts` (client only).
  - **Single main table:** `public.users` (see migrations in `supabase_migrations/**`, types in `src/types/db.ts`). Flexible fields: `users.profile` (JSON), stepwise form data: `users.application` (JSON).

## Auth, API, and Data Patterns

- **Client** gets Firebase ID token, sends to API routes. API verifies with Firebase Admin. Primary key: `firebase_uid` (fallbacks: `phone`, `email`).
- **All profile/application writes:** `POST /api/users/upsert` (see `src/app/api/users/upsert/route.ts`).
  - Input normalization: camelCase→snake_case, lowercased `username`, gender enum, academic-year labels (e.g. `2025-26`).
  - JSON merge: preserves existing `profile`/`application` fields.
  - Never overwrite `student_name` with empty; strips unknown columns, retries on Postgres errors.
  - Tracks `providers[]`, preserves `phone_auth_used` once true.
- **API client helper:** `src/lib/apiClient.ts` auto-attaches `Authorization: Bearer <token>`, retries once on `{ status: 401, error: "invalid_token" }`.

## Client vs Server Rules

- Any component using MUI, Emotion, React context, or `next/navigation` **must** start with `"use client"` (see `src/app/components/**`).
- **Never** import `lib/supabaseServer` on the client; use `lib/supabase.ts` (client) and `lib/supabaseServer.ts` (server).
- If a page uses `useSearchParams()` or `useRouter()`, wrap in `<Suspense>` (see `src/app/auth/login/page.tsx`).

## Realtime, Caching, Sessions

- Local cache: keys prefixed `user-cache:` with TTL logic (`src/lib/userCache.ts`, tests: `src/lib/__tests__/user-cache.test.ts`).
- Realtime: `src/hooks/useSyncedUser.ts` (subscribe with correct column filter: `id` or `firebase_uid`).
- Middleware: `src/middleware.ts` guards `/dashboard/*` via HMAC-signed `neram_session` cookie (`SESSION_SECRET`). Extend `config.matcher` for new protected areas.

## Avatars & Storage

- `GET /api/avatar-url`: checks `users.avatar_path`, then legacy `profiles.avatar_path`, then signs a URL from bucket `avatars` (service-role client).

## Environment & Dev Workflow

- **Required envs:** Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), Firebase client (`NEXT_PUBLIC_FIREBASE_*`), Firebase Admin (`FIREBASE_SERVICE_ACCOUNT_JSON` or discrete vars).
- **Scripts:** `dev`, `build`, `start`, `lint`, `typecheck`, `test` (Jest + ts-jest, jsdom). Tests: `src/**/__tests__/**`.
- **Windows:** keep import path casing consistent, avoid absolute filesystem import paths—use relative imports.

## Key Files & Patterns

- `src/app/api/users/upsert/route.ts`: normalization/merge logic for user data.
- `src/lib/apiClient.ts`, `src/lib/supabaseServer.ts`, `src/lib/supabase.ts`: data access patterns.
- `src/middleware.ts`, `src/types/db.ts`, migrations in `supabase_migrations/**`.

---

**For AI agents:**

- Always follow the normalization/merge patterns in `upsert/route.ts` for user data.
- Use the correct Supabase client for client/server code.
- When in doubt, check referenced files above for canonical patterns.
