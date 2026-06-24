-- Generates (or refreshes) payslips for a month from marked attendance, for the
-- caller's in-scope company. Pro-rates base salary against unpaid days
-- (absences + leaves beyond the monthly allowance). Re-running preserves manual
-- bonus/deductions and disbursed status while refreshing attendance-derived fields.
create or replace function public.generate_payroll(p_month text default to_char(current_date, 'YYYY-MM'))
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid := current_company_id();
  m_start date := to_date(p_month || '-01', 'YYYY-MM-DD');
  m_end date := (to_date(p_month || '-01', 'YYYY-MM-DD') + interval '1 month')::date;
  v_allowed int := 2;       -- default paid-leave allowance per month
  working_days int;
  n int := 0;
begin
  if cid is null then
    raise exception 'No company in scope. Switch into a company to generate payroll.' using errcode = 'P0001';
  end if;

  -- Days HR actually ran attendance this month (the proration denominator).
  select count(distinct date) into working_days
  from attendance_records
  where company_id = cid and date >= m_start and date < m_end;

  insert into payslips as p (
    company_id, employee_id, month,
    present_days, absent_days, leave_days, allowed_leaves,
    effective_paid_days, base, bonus, deductions, statutory_deductions,
    advances, net_salary, currency, status
  )
  select
    cid, e.id, p_month,
    att.present_days, att.absent_days, att.leave_days, v_allowed,
    case when working_days > 0
      then working_days - (att.absent_days + greatest(att.leave_days - v_allowed, 0))
      else 0 end,
    b.base_amt, 0, 0, '[]'::jsonb,
    adv.amount,
    b.base_amt - adv.amount,
    e.currency, 'Pending'
  from employees e
  cross join lateral (
    select
      count(*) filter (where ar.status = 'Present')::int as present_days,
      count(*) filter (where ar.status = 'Absent')::int  as absent_days,
      count(*) filter (where ar.status = 'Leave')::int   as leave_days
    from attendance_records ar
    where ar.employee_id = e.id and ar.date >= m_start and ar.date < m_end
  ) att
  cross join lateral (
    select coalesce(sum(a.amount), 0)::numeric as amount
    from advances a
    where a.employee_id = e.id and a.status in ('Approved', 'Settled')
      and a.date >= m_start and a.date < m_end
  ) adv
  cross join lateral (
    select round(
      case when working_days > 0
        then coalesce(e.base_salary, 0) * (working_days - (att.absent_days + greatest(att.leave_days - v_allowed, 0)))::numeric / working_days
        else coalesce(e.base_salary, 0)
      end
    )::numeric as base_amt
  ) b
  where e.company_id = cid and e.status <> 'Inactive'
  on conflict (employee_id, month) do update set
    present_days        = excluded.present_days,
    absent_days         = excluded.absent_days,
    leave_days          = excluded.leave_days,
    allowed_leaves      = excluded.allowed_leaves,
    effective_paid_days = excluded.effective_paid_days,
    base                = excluded.base,
    advances            = excluded.advances,
    net_salary          = excluded.base + p.bonus - p.deductions
                          - coalesce((select sum((d->>'amount')::numeric)
                                      from jsonb_array_elements(p.statutory_deductions) d), 0)
                          - excluded.advances,
    updated_at          = now();

  get diagnostics n = row_count;
  return n;
end $$;

grant execute on function public.generate_payroll(text) to authenticated;
