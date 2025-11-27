-- Migration: Add application_details column to users_duplicate table
-- This column stores payment and application submission data

-- Step 1: Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_duplicate'
      AND column_name = 'application_details'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users_duplicate
    ADD COLUMN application_details JSONB DEFAULT '{}'::jsonb;

    RAISE NOTICE 'Added application_details column';
  ELSE
    RAISE NOTICE 'application_details column already exists';
  END IF;
END $$;

-- Step 2: If you have existing final_fee_payment as a top-level column, migrate it
-- Uncomment this section if you have final_fee_payment as a separate column:

/*
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_duplicate'
      AND column_name = 'final_fee_payment'
      AND table_schema = 'public'
  ) THEN
    -- Migrate data from top-level final_fee_payment to application_details.final_fee_payment
    UPDATE public.users_duplicate
    SET application_details = jsonb_set(
      COALESCE(application_details, '{}'::jsonb),
      '{final_fee_payment}',
      COALESCE(final_fee_payment, '{}'::jsonb)
    )
    WHERE final_fee_payment IS NOT NULL;

    RAISE NOTICE 'Migrated final_fee_payment data to application_details';

    -- Optional: Drop the old column after verifying migration
    -- ALTER TABLE public.users_duplicate DROP COLUMN final_fee_payment;
  END IF;
END $$;
*/

-- Step 3: Verify the structure
SELECT
  id,
  application_details->'final_fee_payment'->>'payment_status' as payment_status,
  application_details->'final_fee_payment'->>'payable_amount' as amount
FROM public.users_duplicate
WHERE application_details IS NOT NULL
LIMIT 5;
