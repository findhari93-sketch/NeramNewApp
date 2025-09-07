-- Migration: 006_add_firebase_uid_unique.sql
-- Purpose: Reintroduce firebase_uid as the stable external identifier and ensure uniqueness when present.

BEGIN;

-- Add firebase_uid column if missing
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS firebase_uid text;

-- Create a partial unique index to enforce uniqueness for non-null values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'ux_users_firebase_uid_not_null'
  ) THEN
    CREATE UNIQUE INDEX ux_users_firebase_uid_not_null ON public.users (firebase_uid) WHERE firebase_uid IS NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.users.firebase_uid IS 'Firebase Auth user UID used as stable external identifier';

COMMIT;
