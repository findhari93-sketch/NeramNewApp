-- Migration: 005_rename_display_name_to_student_name.sql
-- Purpose: Rename users.display_name -> users.student_name

BEGIN;

ALTER TABLE public.users
  RENAME COLUMN display_name TO student_name;

COMMIT;
