-- Migration: 010_add_username_email_auth.sql
-- Purpose: Add username and email columns for email/password authentication support

BEGIN;

-- Add username column if not exists
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Add email column if not exists (might already exist from earlier migrations)
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Create case-insensitive unique constraint on username
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'users_username_lower_idx'
  ) THEN
    CREATE UNIQUE INDEX users_username_lower_idx 
      ON public.users (LOWER(username)) 
      WHERE username IS NOT NULL;
  END IF;
END $$;

-- Ensure unique constraint on email if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'users_email_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX users_email_unique_idx 
      ON public.users (email) 
      WHERE email IS NOT NULL;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.users.username IS 'Unique username for login, case-insensitive';
COMMENT ON COLUMN public.users.email IS 'Email address, mirrored from Firebase for username resolution';

COMMIT;