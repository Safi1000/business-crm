import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, List, KanbanSquare, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, FilterBar } from '@/shared';
import { Button, Select, SegmentedControl, Checkbox } from '@ds/primitives';
import { DataTable, StatusBadge, AvatarStack, DateBadge, type Column } from '@ds/data-display';
import { EmptyState, toast } from '@ds/feedback';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useTasks, useTaskMutations, useProjectsList } from '../hooks';
import { TaskBoard } from '../components/TaskBoard';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import type { Task, TaskStatus } from '@/types';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

function TaskCalendar({ tasks, onAdd, onOpen }: { tasks: Task[]; onAdd: (d: string) => void; onOpen: (t: Task) => void }) {
  const [cursor, setCursor] = useState(new Date('2026-06-01'));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const iso = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">{cursor.toLocaleString('en', { month: 'long', year: 'numeric' })}</h3>
        <div className="flex gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-md p-1.5 hover:bg-surface-sunken"><ChevronLeft size={16} /></button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-md p-1.5 hover:bg-surface-sunken"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-2xs font-semibold uppercase text-content-subtle">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const dayTasks = tasks.filter((t) => t.dueDate === iso(day));
          return (
            <button key={day} onClick={() => onAdd(iso(day))} className="min-h-[72px] rounded-lg border border-line p-1.5 text-left hover:border-brand-300">
              <span className="nums text-xs text-content-muted">{day}</span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayTasks.slice(0, 2).map((t) => (
                  <span key={t.id} onClick={(e) => { e.stopPropagation(); onOpen(t); }} className="truncate rounded bg-brand-50 px-1 py-0.5 text-2xs text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40" title={t.title}>{t.title}</span>
                ))}
                {dayTasks.length > 2 && <span className="text-2xs text-content-subtle">+{dayTasks.length - 2}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TasksPage() {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('board');
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDue, setCreateDue] = useState<string | undefined>();
  const { values, set, reset, activeCount } = useUrlFilters({ search: '', priority: '', project: '', status: '' });
  const { data: projects } = useProjectsList();
  const { data: tasks = [], isLoading } = useTasks({ search: values.search, priority: values.priority, project: values.project, status: values.status });
  const { update } = useTaskMutations();

  const closeCreate = () => {
    setCreateOpen(false);
    setCreateDue(undefined);
    if (params.get('new')) { params.delete('new'); setParams(params, { replace: true }); }
  };

  // Open the create modal on ?new=1 (from a quick-create), then clear the flag so a repeat
  // click while already on this page reopens it. See ClientsListPage for the rationale.
  useEffect(() => {
    if (params.get('new') === '1') {
      setCreateOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const onStatusChange = (id: string, status: TaskStatus) => {
    update.mutate({ id, data: { status } });
    toast.success(`Moved to ${status}`);
  };

  const columns: Column<Task>[] = [
    { key: 'check', header: '', width: '40px', render: () => <Checkbox aria-label="Select task" /> },
    { key: 'title', header: 'Title', sortAccessor: (t) => t.title, render: (t) => <button className="text-left font-medium text-content hover:text-brand-600" onClick={() => setOpenTask(t)}>{t.title}</button> },
    { key: 'project', header: 'Project', render: (t) => <span className="text-content-muted">{t.projectName ?? 'Standalone'}</span> },
    { key: 'assignees', header: 'Assignees', render: (t) => <AvatarStack names={t.assignees} max={3} size="xs" /> },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} size="sm" tone={t.priority === 'Urgent' ? 'danger' : t.priority === 'High' ? 'warning' : 'neutral'} /> },
    { key: 'due', header: 'Due', sortAccessor: (t) => t.dueDate ?? '', render: (t) => (t.dueDate ? <span className="flex items-center gap-2">{t.dueDate}{t.status !== 'Done' && <DateBadge date={t.dueDate} />}</span> : '—') },
    {
      key: 'status', header: 'Status',
      render: (t) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select sizeVariant="sm" className="w-36" value={t.status} onChange={(e) => onStatusChange(t.id, e.target.value as TaskStatus)} options={STATUSES.map((s) => ({ value: s, label: s }))} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="All tasks across projects, plus standalone to-dos."
        actions={<Button icon={Plus} onClick={() => setCreateOpen(true)}>New Task</Button>}
      />

      <div className="mb-4 flex items-center justify-between">
        <SegmentedControl
          value={view}
          onChange={setView}
          segments={[
            { value: 'list', label: 'List', icon: List },
            { value: 'board', label: 'Board', icon: KanbanSquare },
            { value: 'calendar', label: 'Calendar', icon: CalendarDays },
          ]}
        />
      </div>

      <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search tasks…" activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-32" value={values.priority ?? ''} onChange={(e) => set({ priority: e.target.value })} options={[{ value: '', label: 'Priority' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]} />
        <Select sizeVariant="sm" className="w-40" value={values.project ?? ''} onChange={(e) => set({ project: e.target.value })} options={[{ value: '', label: 'All Projects' }, ...(projects?.rows ?? []).map((p) => ({ value: p.id, label: p.name }))]} />
        <Select sizeVariant="sm" className="w-32" value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })} options={[{ value: '', label: 'Status' }, ...STATUSES.map((s) => ({ value: s, label: s }))]} />
      </FilterBar>

      {view === 'list' && (
        <DataTable data={tasks} columns={columns} rowKey={(t) => t.id} loading={isLoading} onRowClick={(t) => setOpenTask(t)} empty={<EmptyState icon={List} title="No tasks" description="Create your first task." action={<Button icon={Plus} onClick={() => setCreateOpen(true)}>New Task</Button>} />} />
      )}
      {view === 'board' && (tasks.length === 0 && !isLoading ? <EmptyState icon={KanbanSquare} title="No tasks" description="Create your first task." action={<Button icon={Plus} onClick={() => setCreateOpen(true)}>New Task</Button>} /> : <TaskBoard tasks={tasks} onOpen={setOpenTask} onStatusChange={onStatusChange} />)}
      {view === 'calendar' && <TaskCalendar tasks={tasks} onOpen={setOpenTask} onAdd={(d) => { setCreateDue(d); setCreateOpen(true); }} />}

      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} />
      <CreateTaskModal open={createOpen} onClose={closeCreate} defaultDue={createDue} />
    </div>
  );
}
