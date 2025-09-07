-- Migration: 004_users_uuid_pk_drop_firebase_uid.sql
-- Purpose: Switch to a single UUID primary key `id` and drop `firebase_uid`.

BEGIN;

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Add a new UUID column and backfill
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_new uuid;
UPDATE public.users SET id_new = COALESCE(id_new, gen_random_uuid());

-- 2) Preserve old text id in a legacy column for reference/auditing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS legacy_external_id text;
UPDATE public.users SET legacy_external_id = COALESCE(legacy_external_id, id);

-- 3) Replace primary key: drop old PK, set id_new NOT NULL, make it PK
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE public.users ALTER COLUMN id_new SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id_new);

-- 4) Drop old id column and rename id_new -> id
ALTER TABLE public.users DROP COLUMN IF EXISTS id;
ALTER TABLE public.users RENAME COLUMN id_new TO id;

-- 5) Drop firebase_uid and related index
DROP INDEX IF EXISTS idx_users_firebase_uid;
ALTER TABLE public.users DROP COLUMN IF EXISTS firebase_uid;

-- 6) Update RLS policies to use UUID id = auth.uid()
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own record" ON public.users;
CREATE POLICY "Users can select own record"
  ON public.users FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

COMMIT;
