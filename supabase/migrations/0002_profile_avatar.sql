-- Personal profile: per-user avatar shown in the app shell (separate from the
-- company logo). full_name / email already exist on profiles.
alter table public.profiles add column if not exists avatar_url text;
