import { useState } from 'react';
import { ListTodo } from 'lucide-react';
import { PageHeader, FilterBar } from '@/shared';
import { Select } from '@ds/primitives';
import { DataTable, StatusBadge, DateBadge, type Column } from '@ds/data-display';
import { EmptyState, toast } from '@ds/feedback';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useMe, useMyTasks } from '../hooks';
import { tasksApi } from '@/data/mock-api';
import type { Task, TaskStatus } from '@/types';

const STATUSES = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

export function EmployeeTasks() {
  const { data: me } = useMe();
  const { data: tasks = [], isLoading, refetch } = useMyTasks(me?.name);
  const { values, set, reset, activeCount } = useUrlFilters({ status: '', priority: '' });
  const [busy, setBusy] = useState(false);

  const filtered = tasks.filter((t) => (!values.status || t.status === values.status) && (!values.priority || t.priority === values.priority));

  const setStatus = async (id: string, status: TaskStatus) => {
    setBusy(true);
    await tasksApi.update(id, { status });
    await refetch();
    setBusy(false);
    toast.success(`Moved to ${status}`);
  };

  const columns: Column<Task>[] = [
    { key: 'title', header: 'Title', render: (t) => <span className="font-medium text-content">{t.title}</span> },
    { key: 'project', header: 'Project', render: (t) => <span className="text-content-muted">{t.projectName ?? 'Standalone'}</span> },
    { key: 'due', header: 'Due', render: (t) => (t.dueDate ? <DateBadge date={t.dueDate} /> : '—') },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} size="sm" tone={t.priority === 'Urgent' ? 'danger' : 'neutral'} /> },
    {
      key: 'status', header: 'Status',
      render: (t) => <Select sizeVariant="sm" className="w-36" value={t.status} disabled={busy} onChange={(e) => setStatus(t.id, e.target.value as TaskStatus)} options={STATUSES.map((s) => ({ value: s, label: s }))} />,
    },
  ];

  return (
    <div>
      <PageHeader title="My Tasks" description="Tasks assigned to you. Update status and log time." />
      <FilterBar activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-32" value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })} options={[{ value: '', label: 'Status' }, ...STATUSES.map((s) => ({ value: s, label: s }))]} />
        <Select sizeVariant="sm" className="w-32" value={values.priority ?? ''} onChange={(e) => set({ priority: e.target.value })} options={[{ value: '', label: 'Priority' }, ...['Low', 'Medium', 'High', 'Urgent'].map((p) => ({ value: p, label: p }))]} />
      </FilterBar>
      <DataTable data={filtered} columns={columns} rowKey={(t) => t.id} loading={isLoading} empty={<EmptyState icon={ListTodo} title="No tasks assigned" description="You're all caught up." />} />
    </div>
  );
}
