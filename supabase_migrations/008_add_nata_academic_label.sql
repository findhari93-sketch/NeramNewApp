-- Migration: 008_add_nata_academic_label.sql
-- Purpose: Keep displaying NATA/JEE attempt year as an academic-year string (e.g., 2025-26)
-- without changing the canonical integer storage in nata_attempt_year.

BEGIN;

-- Add a generated label column that formats the academic year as YYYY-YY
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS nata_academic_label text
GENERATED ALWAYS AS (
  CASE
    WHEN nata_attempt_year IS NULL THEN NULL
    ELSE (
      nata_attempt_year::text || '-' ||
      lpad(((nata_attempt_year + 1) % 100)::text, 2, '0')
    )
  END
) STORED;

COMMENT ON COLUMN public.users.nata_academic_label IS 'Formatted academic year label derived from nata_attempt_year (e.g., 2025-26).';

COMMIT;
