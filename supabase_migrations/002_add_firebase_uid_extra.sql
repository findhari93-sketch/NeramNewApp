-- Migration: 002_add_firebase_uid_extra.sql
-- Purpose: Add firebase_uid and extra columns for phone-based user upsert

BEGIN;

-- Add firebase_uid column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

-- Add extra JSONB column for unknown fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS extra JSONB DEFAULT '{}'::jsonb;

-- Create index on firebase_uid for performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users USING btree (firebase_uid);

-- Note: phone column already has UNIQUE constraint from 001_create_users_table.sql

COMMIT;