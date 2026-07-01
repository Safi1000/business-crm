-- 0004_input_validation.sql
-- BUG-01 / BUG-08 — backend input validation.
--
-- Mirrors the frontend rules in src/lib/validation.ts so a crafted request that
-- bypasses the UI (or a bad edge function) still cannot persist unsafe/blank data.
-- PostgREST surfaces a failed CHECK as HTTP 400 with the constraint message,
-- which the frontend already renders via `toast.error(err.message)`.
--
-- Apply against the TechXServe Supabase project only.

-- ── Reusable predicates ────────────────────────────────────────────────
-- Non-blank (rejects whitespace-only).
create or replace function public.is_present(v text)
returns boolean language sql immutable as $$
  select v is not null and length(btrim(v)) > 0
$$;

-- Free-text safety: blocks injection / script signatures while allowing normal
-- punctuation. Mirror of INJECTION_PATTERN in src/lib/validation.ts.
create or replace function public.is_safe_text(v text)
returns boolean language sql immutable as $$
  select v is null or v !~* '(<\s*script|<\s*/?[a-z]|javascript:|on\w+\s*=|\munion\M[\s\S]*\mselect\M|\mor\M\s+[''"0-9]|[0-9]+\s*=\s*[0-9]+|--|/\*|\*/|[<>"''`\\])'
$$;

-- Strict person name: letters, spaces, hyphens, apostrophes, periods.
create or replace function public.is_person_name(v text)
returns boolean language sql immutable as $$
  select v is null or v ~ '^[A-Za-z][A-Za-z\s.''-]*$'
$$;

-- ── BUG-08: tasks must have a real title ───────────────────────────────
-- Clean up any pre-existing blank rows first, then enforce.
update public.tasks set title = btrim(title) where title is not null;
delete from public.tasks where title is null or length(btrim(title)) = 0;

alter table public.tasks drop constraint if exists tasks_title_present;
alter table public.tasks
  add constraint tasks_title_present check (public.is_present(title) and public.is_safe_text(title));

-- ── BUG-01: structured/label fields ────────────────────────────────────
alter table public.employees drop constraint if exists employees_name_valid;
alter table public.employees
  add constraint employees_name_valid check (public.is_present(name) and public.is_person_name(name));

alter table public.clients drop constraint if exists clients_name_safe;
alter table public.clients
  add constraint clients_name_safe check (public.is_present(name) and public.is_safe_text(name));

alter table public.projects drop constraint if exists projects_name_safe;
alter table public.projects
  add constraint projects_name_safe check (public.is_present(name) and public.is_safe_text(name));

-- NOTE: add analogous CHECKs for other free-text columns (address, notes,
-- description, reference) as needed:
--   ... check (public.is_safe_text(address))
