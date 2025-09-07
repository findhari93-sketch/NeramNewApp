-- Migration: 001_create_users_table.sql
-- Purpose: create a `users` table to store profile and application data with stricter types, trigger and RLS

BEGIN;

-- 1) Basic types/enums
DO $$ BEGIN
  -- CREATE TYPE without IF NOT EXISTS; catch duplicate_object in EXCEPTION block for idempotence
  CREATE TYPE public.gender_t AS ENUM ('male','female','nonbinary','prefer_not_to_say');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Table
CREATE TABLE IF NOT EXISTS public.users (
  id                 text PRIMARY KEY,
  email              text UNIQUE,
  phone              text UNIQUE,
  display_name       text,
  father_name        text,
  gender             public.gender_t,
  zip_code           text,
  city               text,
  state              text,
  country            text,
  instagram_handle   text,
  education_type     text,
  selected_course    text,
  course_fee         numeric(12,2),
  discount           numeric(12,2) DEFAULT 0,
  payment_type       text,
  total_payable      numeric(12,2),
  created_at         timestamptz DEFAULT now(),
  last_sign_in       timestamptz,

  -- auth / providers
  providers          jsonb DEFAULT '[]'::jsonb,
  phone_auth_used    boolean DEFAULT false,

  -- social raw blobs
  google_info        jsonb,
  linkedin_info      jsonb,

  -- flexible shapes
  profile            jsonb DEFAULT '{}'::jsonb,
  application        jsonb DEFAULT '{}'::jsonb,

  updated_at         timestamptz DEFAULT now()
);

-- 3) Useful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users USING btree (phone);
CREATE INDEX IF NOT EXISTS idx_users_city_state ON public.users (city, state);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at DESC);

-- 4) Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) RLS + policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Owners (the logged-in user) can see and write only their row (id == auth.uid()).
-- Policies: drop if exists then create (Postgres does not support CREATE POLICY IF NOT EXISTS)
DROP POLICY IF EXISTS "Users can select own record" ON public.users;
CREATE POLICY "Users can select own record"
  ON public.users FOR SELECT
  USING (id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

COMMIT;

-- Note: Admin/service role (using SUPABASE_SERVICE_ROLE_KEY) bypasses RLS and can perform any upsert.
