-- Migration: 007_update_rls_policies_to_firebase_uid.sql
-- Purpose: Update RLS policies to identify users by firebase_uid = auth.uid()

BEGIN;

-- Ensure the column exists
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS firebase_uid text;

-- Drop old policies
DROP POLICY IF EXISTS "Users can select own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- Enable RLS (no-op if already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Recreate policies based on firebase_uid
CREATE POLICY "Users can select own record"
  ON public.users FOR SELECT
  USING (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (firebase_uid = auth.uid()::text);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (firebase_uid = auth.uid()::text)
  WITH CHECK (firebase_uid = auth.uid()::text);

COMMIT;
