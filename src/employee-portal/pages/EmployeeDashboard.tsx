import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Plane, ListTodo, Wallet, Megaphone } from 'lucide-react';
import { KpiStrip, useFormatMoney } from '@/shared';
import { Card, CardHeader, CardTitle, Button } from '@ds/primitives';
import { KPICard, StatusBadge, DataTable, DateBadge, type Column } from '@ds/data-display';
import { EmptyState } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { useMe, useMyPayslips, useMyTasks } from '../hooks';
import { routes } from '@/config/routes';
import type { Task } from '@/types';

const ANNOUNCEMENTS = [
  { title: 'Eid holidays announced', body: 'Office closed 6–9 June. Enjoy the break!', at: '2026-06-01' },
  { title: 'New health insurance policy', body: 'Coverage upgraded from July. Details in Documents.', at: '2026-05-28' },
  { title: 'Quarterly town hall', body: 'Join us on the 15th at 4 PM in the Karachi office.', at: '2026-05-20' },
];

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const money = useFormatMoney();
  const { data: me } = useMe();
  const { data: payslips = [] } = useMyPayslips();
  const { data: tasks = [] } = useMyTasks(me?.name);

  const latest = payslips[0];
  const dueThisWeek = useMemo(() => tasks.filter((t) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate).getTime() - Date.now() < 7 * 864e5), [tasks]);

  const taskCols: Column<Task>[] = [
    { key: 'title', header: 'Title', render: (t) => <span className="font-medium text-content">{t.title}</span> },
    { key: 'project', header: 'Project', render: (t) => <span className="text-content-muted">{t.projectName ?? 'Standalone'}</span> },
    { key: 'due', header: 'Due', render: (t) => (t.dueDate ? <DateBadge date={t.dueDate} /> : '—') },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} size="sm" tone={t.priority === 'Urgent' ? 'danger' : 'neutral'} /> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-content">Good morning, {me?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-content-muted">{formatDate(new Date())} · You're marked <span className="font-medium text-success-strong">Present</span> today.</p>
        </div>
        <Button icon={CalendarCheck}>Mark Attendance Now</Button>
      </div>

      <KpiStrip cols={4}>
        <KPICard label="Leave Balance" value={14} format={(n) => `${Math.round(n)} days`} icon={Plane} tone="success" onClick={() => navigate(routes.epLeaves)} />
        <KPICard label="Attendance (Month)" value="22 / 1 / 2" icon={CalendarCheck} tone="brand" onClick={() => navigate(routes.epAttendance)} />
        <KPICard label="Tasks Due This Week" value={dueThisWeek.length} format={(n) => String(Math.round(n))} icon={ListTodo} tone="warning" onClick={() => navigate(routes.epTasks)} />
        <KPICard label="Latest Payslip" value={latest ? money(latest.netSalary) : '—'} icon={Wallet} tone="info" onClick={() => navigate(routes.epPayslips)} />
      </KpiStrip>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="none">
          <CardTitle className="p-5 pb-3">Upcoming Tasks</CardTitle>
          <DataTable data={tasks.filter((t) => t.status !== 'Done').slice(0, 6)} columns={taskCols} rowKey={(t) => t.id}
            empty={<EmptyState icon={ListTodo} title="No open tasks" description="You're all caught up." size="sm" />} />
        </Card>
        <Card>
          <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
          <ul className="space-y-4">
            {ANNOUNCEMENTS.map((a) => (
              <li key={a.title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40"><Megaphone size={15} /></span>
                <div><p className="text-sm font-medium text-content">{a.title}</p><p className="text-xs text-content-muted">{a.body}</p><p className="mt-0.5 text-2xs text-content-subtle">{formatDate(a.at)}</p></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
