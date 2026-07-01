-- 0006_employee_documents.sql
-- BUG-10 — itemized missing documents.
--
-- Stores which document types each employee has uploaded and exposes an RPC that
-- returns { required, uploaded, missing } so the UI can list the specific
-- missing documents (not just a boolean).
--
-- Apply against the TechXServe Supabase project only.

-- Uploaded documents for an employee.
create table if not exists public.employee_documents (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references public.employees(id) on delete cascade,
  doc_type       text not null,
  drive_file_id  text,
  drive_view_url text,
  uploaded_at    timestamptz not null default now(),
  unique (employee_id, doc_type)
);

alter table public.employee_documents enable row level security;

-- The set of document types every employee is expected to provide.
create table if not exists public.required_document_types (
  doc_type text primary key,
  position int not null default 0
);

insert into public.required_document_types (doc_type, position) values
  ('CNIC Copy', 1),
  ('Employment Contract', 2),
  ('Experience Letter', 3),
  ('Educational Certificate', 4),
  ('Bank Account Proof', 5)
on conflict (doc_type) do nothing;

-- Returns required / uploaded / missing document type names for one employee.
create or replace function public.employee_documents_status(p_employee_id uuid)
returns json language sql stable as $$
  with req as (
    select doc_type from public.required_document_types order by position
  ),
  up as (
    select distinct doc_type from public.employee_documents where employee_id = p_employee_id
  )
  select json_build_object(
    'required', coalesce((select json_agg(doc_type order by position) from public.required_document_types), '[]'::json),
    'uploaded', coalesce((select json_agg(doc_type) from up), '[]'::json),
    'missing',  coalesce((select json_agg(r.doc_type) from req r where r.doc_type not in (select doc_type from up)), '[]'::json)
  );
$$;
