-- Migration: 009_replace_nata_attempt_year_with_label.sql
-- Purpose: Replace integer nata_attempt_year with academic-year label string safely.

BEGIN;

-- 1) Create a temporary plain text column to store the formatted label
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS nata_attempt_label_tmp text;

-- 2) Backfill tmp from the existing integer nata_attempt_year if present
UPDATE public.users
   SET nata_attempt_label_tmp = CASE
     WHEN EXISTS (
       SELECT 1 FROM information_schema.columns c
       WHERE c.table_schema = 'public' AND c.table_name = 'users' AND c.column_name = 'nata_attempt_year'
     ) THEN (
       CASE
         WHEN nata_attempt_year IS NULL THEN NULL
         ELSE (
           nata_attempt_year::text || '-' || lpad(((nata_attempt_year + 1) % 100)::text, 2, '0')
         )
       END
     )
     ELSE nata_attempt_label_tmp
   END;

-- 3) If a generated label column exists, drop it now (we have tmp)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'nata_academic_label'
  ) THEN
    ALTER TABLE public.users DROP COLUMN nata_academic_label;
  END IF;
END $$;

-- 4) Drop the old integer column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'nata_attempt_year'
  ) THEN
    ALTER TABLE public.users DROP COLUMN nata_attempt_year;
  END IF;
END $$;

-- 5) Rename tmp to nata_attempt_year (final text label column)
ALTER TABLE public.users
  RENAME COLUMN nata_attempt_label_tmp TO nata_attempt_year;

COMMENT ON COLUMN public.users.nata_attempt_year IS 'Academic year label (e.g., 2025-26) for planned NATA/JEE attempt.';

COMMIT;
