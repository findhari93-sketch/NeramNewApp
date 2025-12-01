-- ========================================
-- Payment Email & Notification System
-- Database Verification Script
-- ========================================

-- 1. Verify notifications table exists and has correct structure
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';

-- Expected: 1 row showing notifications table exists

-- 2. Check notifications table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid, NOT NULL, gen_random_uuid())
-- user_id (uuid, NOT NULL)
-- notification_type (text, NOT NULL)
-- title (text, NOT NULL)
-- message (text, NOT NULL)
-- data (jsonb, default '{}')
-- is_read (boolean, default false)
-- priority (text, default 'normal')
-- created_at (timestamptz, default now())
-- read_at (timestamptz, nullable)
-- read_by (uuid, nullable)

-- 3. Verify check constraints
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'notifications'
  AND con.contype = 'c';

-- Expected:
-- valid_notification_type: notification_type IN (...)
-- valid_priority: priority IN ('low', 'normal', 'high', 'urgent')

-- 4. Verify foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'notifications';

-- Expected:
-- notifications_user_id_fkey: user_id -> users_duplicate(id) ON DELETE CASCADE

-- 5. Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY indexname;

-- Expected indexes:
-- idx_notifications_user_id
-- idx_notifications_created_at
-- idx_notifications_is_read
-- idx_notifications_type
-- idx_notifications_priority
-- idx_notifications_unread_priority

-- 6. Test notification insertion (dry run - will rollback)
BEGIN;

-- Insert test user notification
INSERT INTO notifications (
  user_id,
  notification_type,
  title,
  message,
  data,
  priority
)
SELECT 
  id,
  'payment_completed',
  'Test Payment Notification',
  'This is a test payment notification',
  jsonb_build_object(
    'payment_id', 'pay_TEST123456',
    'amount', 25000,
    'method', 'upi'
  ),
  'high'
FROM users_duplicate
LIMIT 1;

-- Verify insertion
SELECT * FROM notifications WHERE title = 'Test Payment Notification';

ROLLBACK;  -- Don't actually save the test record

-- 7. Check admin users who will receive notifications
SELECT 
  id,
  account->>'role' AS role,
  basic->>'student_name' AS name,
  contact->>'email' AS email
FROM users_duplicate
WHERE account->>'role' = 'admin';

-- If no results, you may need to manually set admin role:
-- UPDATE users_duplicate 
-- SET account = jsonb_set(account, '{role}', '"admin"')
-- WHERE contact->>'email' = 'admin@neramclasses.com';

-- 8. Check recent payment notifications
SELECT 
  n.id,
  n.notification_type,
  n.title,
  n.message,
  n.data,
  n.is_read,
  n.priority,
  n.created_at,
  u.basic->>'student_name' AS user_name,
  u.contact->>'email' AS user_email
FROM notifications n
JOIN users_duplicate u ON n.user_id = u.id
WHERE n.notification_type IN ('payment_completed', 'payment_failed')
ORDER BY n.created_at DESC
LIMIT 10;

-- 9. Unread notification count per user
SELECT 
  n.user_id,
  u.basic->>'student_name' AS user_name,
  u.account->>'role' AS role,
  COUNT(*) AS unread_count
FROM notifications n
JOIN users_duplicate u ON n.user_id = u.id
WHERE n.is_read = false
GROUP BY n.user_id, u.basic, u.account
ORDER BY unread_count DESC;

-- 10. Payment notification statistics
SELECT 
  notification_type,
  priority,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE is_read = true) AS read_count,
  COUNT(*) FILTER (WHERE is_read = false) AS unread_count,
  MIN(created_at) AS first_notification,
  MAX(created_at) AS last_notification
FROM notifications
WHERE notification_type IN ('payment_completed', 'payment_failed', 'payment_pending')
GROUP BY notification_type, priority
ORDER BY notification_type, priority;

-- ========================================
-- Troubleshooting Queries
-- ========================================

-- If notifications table doesn't exist, create it:
/*
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal'::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  read_by UUID,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES users_duplicate(id) ON DELETE CASCADE,
  CONSTRAINT valid_notification_type CHECK (
    notification_type = ANY (ARRAY[
      'application_submitted'::text,
      'application_approved'::text,
      'application_rejected'::text,
      'profile_updated'::text,
      'payment_pending'::text,
      'payment_completed'::text,
      'payment_failed'::text,
      'document_uploaded'::text,
      'user_registered'::text
    ])
  ),
  CONSTRAINT valid_priority CHECK (
    priority = ANY (ARRAY[
      'low'::text,
      'normal'::text,
      'high'::text,
      'urgent'::text
    ])
  )
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_priority ON notifications(is_read, priority, created_at DESC) 
  WHERE is_read = false;
*/

-- Manual test: Create admin notification for recent payment
/*
INSERT INTO notifications (
  user_id,
  notification_type,
  title,
  message,
  data,
  priority
)
SELECT 
  (SELECT id FROM users_duplicate WHERE account->>'role' = 'admin' LIMIT 1),
  'payment_completed',
  'Manual Test Notification',
  'Testing admin payment notification system',
  jsonb_build_object(
    'payment_id', 'pay_TEST',
    'amount', 25000,
    'student_name', 'Test Student'
  ),
  'high';
*/

-- Delete test notifications
-- DELETE FROM notifications WHERE title LIKE '%Test%';

-- ========================================
-- Performance Analysis
-- ========================================

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM notifications
WHERE user_id = (SELECT id FROM users_duplicate LIMIT 1)
  AND is_read = false
ORDER BY created_at DESC
LIMIT 20;

-- Check table size
SELECT 
  pg_size_pretty(pg_total_relation_size('notifications')) AS total_size,
  pg_size_pretty(pg_relation_size('notifications')) AS table_size,
  pg_size_pretty(pg_total_relation_size('notifications') - pg_relation_size('notifications')) AS indexes_size;

-- ========================================
-- Cleanup & Maintenance
-- ========================================

-- Archive old read notifications (older than 90 days)
/*
DELETE FROM notifications
WHERE is_read = true
  AND created_at < NOW() - INTERVAL '90 days';
*/

-- Reset all notifications to unread (for testing)
/*
UPDATE notifications
SET is_read = false, read_at = NULL, read_by = NULL;
*/
