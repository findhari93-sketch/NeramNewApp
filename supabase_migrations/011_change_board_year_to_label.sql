-- 011_change_board_year_to_label.sql
-- Migrate users.board_year from integer start-year to academic-year label (e.g., "2025-26").

BEGIN;

-- Change type to text and convert existing integer values to label
ALTER TABLE public.users
  ALTER COLUMN board_year TYPE text
  USING (
    CASE
      WHEN board_year IS NULL THEN NULL
      ELSE board_year::text || '-' || lpad(((board_year + 1) % 100)::text, 2, '0')
    END
  );

COMMIT;
