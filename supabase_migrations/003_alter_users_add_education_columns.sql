-- Add dedicated education-related columns to users table
-- Run this SQL in your Supabase project's SQL editor or via migration tooling.

alter table if exists public.users
  add column if not exists nata_attempt_year integer,
  add column if not exists school_std text,
  add column if not exists board text,
  add column if not exists board_year integer,
  add column if not exists school_name text,
  add column if not exists college_name text,
  add column if not exists college_year text,
  add column if not exists diploma_course text,
  add column if not exists diploma_year text,
  add column if not exists diploma_college text,
  add column if not exists other_description text;

-- Optional: comment for documentation
comment on column public.users.nata_attempt_year is 'Academic start year for planned NATA/JEE attempt';
comment on column public.users.school_std is 'School standard (e.g., 11th/12th)';
comment on column public.users.board is 'School board (CBSE/ICSE/State/Other)';
comment on column public.users.board_year is '12th completion academic start year';
comment on column public.users.school_name is 'School/college name for school pathway';
comment on column public.users.college_name is 'College name when education_type=college';
comment on column public.users.college_year is 'Current year in college (1st/2nd/...)';
comment on column public.users.diploma_course is 'Diploma course name';
comment on column public.users.diploma_year is 'Diploma year (First/Second/Third/Completed)';
comment on column public.users.diploma_college is 'Diploma college name';
comment on column public.users.other_description is 'Freeform education description when education_type=other';
