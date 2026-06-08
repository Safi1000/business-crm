import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle2, Hourglass, Check, X } from 'lucide-react';
import { PageHeader, KpiStrip } from '@/shared';
import { Select } from '@ds/primitives';
import { Button } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, Avatar, type Column } from '@ds/data-display';
import { EmptyState, toast } from '@ds/feedback';
import { employeesApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import { useUrlFilters } from '@/lib/useUrlFilters';

interface Sheet { id: string; employee: string; week: string; hours: number; status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'; }

export function TimesheetsPage() {
  const { values, set, reset, activeCount } = useUrlFilters({ status: '' });
  const { data: emps } = useQuery({ queryKey: qk.employees({ pageSize: 1000 }), queryFn: () => employeesApi.list({ pageSize: 1000 }) });
  const [overrides, setOverrides] = useState<Record<string, Sheet['status']>>({});

  const sheets: Sheet[] = useMemo(() => {
    const rows = (emps?.rows ?? []).filter((e) => e.status === 'Active').slice(0, 14);
    return rows.map((e, i) => ({
      id: e.id,
      employee: e.name,
      week: '2–8 Jun 2026',
      hours: 32 + ((i * 7) % 14),
      status: overrides[e.id] ?? (i % 4 === 0 ? 'Approved' : i % 4 === 1 ? 'Submitted' : i % 4 === 2 ? 'Draft' : 'Submitted'),
    }));
  }, [emps, overrides]);

  const filtered = sheets.filter((s) => !values.status || s.status === values.status);
  const kpis = {
    submitted: sheets.filter((s) => s.status === 'Submitted').length,
    approved: sheets.filter((s) => s.status === 'Approved').length,
    hours: sheets.reduce((s, x) => s + x.hours, 0),
  };

  const setStatus = (id: string, status: Sheet['status']) => { setOverrides((o) => ({ ...o, [id]: status })); toast.success(`Timesheet ${status.toLowerCase()}`); };

  const columns: Column<Sheet>[] = [
    { key: 'employee', header: 'Employee', render: (s) => <div className="flex items-center gap-2.5"><Avatar name={s.employee} size="sm" /><span className="font-medium text-content">{s.employee}</span></div> },
    { key: 'week', header: 'Week', render: (s) => s.week },
    { key: 'hours', header: 'Hours', align: 'right', render: (s) => <span className="nums font-medium">{s.hours}h</span> },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} tone={s.status === 'Approved' ? 'success' : s.status === 'Submitted' ? 'info' : s.status === 'Rejected' ? 'danger' : 'neutral'} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (s) => (s.status === 'Submitted' ? (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" icon={Check} onClick={() => setStatus(s.id, 'Approved')}>Approve</Button>
          <Button size="sm" variant="ghost" icon={X} onClick={() => setStatus(s.id, 'Rejected')}>Reject</Button>
        </div>
      ) : null),
    },
  ];

  return (
    <div>
      <PageHeader title="Timesheets" description="Review and approve weekly timesheets across the team." />
      <KpiStrip cols={3}>
        <KPICard label="Awaiting Approval" value={kpis.submitted} format={(n) => String(Math.round(n))} icon={Hourglass} tone="warning" />
        <KPICard label="Approved" value={kpis.approved} format={(n) => String(Math.round(n))} icon={CheckCircle2} tone="success" />
        <KPICard label="Total Hours Logged" value={kpis.hours} format={(n) => `${Math.round(n)}h`} icon={Clock} tone="brand" />
      </KpiStrip>
      <div className="mb-4 flex items-center gap-2">
        <Select sizeVariant="sm" className="w-40" value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })} options={[{ value: '', label: 'All Statuses' }, ...['Draft', 'Submitted', 'Approved', 'Rejected'].map((s) => ({ value: s, label: s }))]} />
        {activeCount > 0 && <button onClick={reset} className="text-sm font-medium text-brand-600">Reset</button>}
      </div>
      <DataTable data={filtered} columns={columns} rowKey={(s) => s.id} empty={<EmptyState icon={Clock} title="No timesheets" description="Submitted timesheets will appear here." />} />
    </div>
  );
}
