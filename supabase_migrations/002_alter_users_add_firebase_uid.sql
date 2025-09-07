-- Migration: 002_alter_users_add_firebase_uid.sql
-- Purpose: add missing firebase_uid column and ensure id has a default for inserts

BEGIN;

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add firebase_uid column if it does not exist
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS firebase_uid text;

-- Optional but helpful: index/unique constraint for quick lookup
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_users_firebase_uid'
  ) THEN
    CREATE INDEX idx_users_firebase_uid ON public.users (firebase_uid);
  END IF;
END $$;

-- Give id a default to avoid mandatory id on inserts when not provided
ALTER TABLE public.users
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

COMMIT;
