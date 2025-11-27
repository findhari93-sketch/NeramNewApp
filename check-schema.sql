-- Run this in Supabase SQL Editor to check your table structure

-- Check if application_details column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users_duplicate'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if any row has application_details
SELECT id,
  application_details IS NOT NULL as has_app_details,
  final_fee_payment IS NOT NULL as has_final_fee
FROM users_duplicate
LIMIT 5;
