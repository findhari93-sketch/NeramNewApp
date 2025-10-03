-- 012_add_nata_calculator_sessions_jsonb.sql
-- Purpose: Add a dedicated JSONB column to store NATA calculator sessions per user.

BEGIN;

-- Add JSONB column to hold a map of sessions keyed by id (e.g., ISO timestamp)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS nata_calculator_sessions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Optional: add a GIN index to accelerate containment queries, if needed later.
-- Note: Keep disabled by default to avoid unnecessary index bloat for small data.
-- DO $$ BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_indexes
--     WHERE schemaname = 'public' AND indexname = 'users_nata_sessions_gin_idx'
--   ) THEN
--     CREATE INDEX users_nata_sessions_gin_idx
--       ON public.users USING GIN (nata_calculator_sessions);
--   END IF;
-- END $$;

COMMENT ON COLUMN public.users.nata_calculator_sessions IS 'Map of NATA calculator sessions keyed by session id (ISO timestamp). Each value matches NataCalculatorSession shape.';

COMMIT;
