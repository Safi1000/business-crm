import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, KanbanSquare, FolderKanban, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader, KpiStrip, FilterBar, useFormatMoney } from '@/shared';
import { Button, Select, SegmentedControl } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, Avatar, ProgressBar, type Column, type SortState } from '@ds/data-display';
import { EmptyState, toast } from '@ds/feedback';
import { Stagger } from '@ds/motion';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useProjects, useProjectMutations } from '../hooks';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { routes } from '@/config/routes';
import type { Project, ProjectStatus } from '@/types';

const PAGE_SIZE = 50;
const STATUSES: ProjectStatus[] = ['Lead', 'Active', 'On Hold', 'Completed'];

function spentPct(p: Project) {
  return p.budget ? Math.round((p.spent / p.budget) * 100) : 0;
}

export function ProjectsListPage() {
  const navigate = useNavigate();
  const money = useFormatMoney();
  const [view, setView] = useState('list');
  const [addOpen, setAddOpen] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: 'name', dir: 'asc' });
  const { values, set, reset, activeCount } = useUrlFilters({ search: '', status: '', billingModel: '' });
  const { data, isLoading } = useProjects({ search: values.search, status: values.status, billingModel: values.billingModel, pageSize: PAGE_SIZE, sortKey: sort.key, sortDir: sort.dir });
  const { update } = useProjectMutations();
  const projects = useMemo(() => data?.rows ?? [], [data]);

  const kpis = useMemo(() => {
    const active = projects.filter((p) => p.status === 'Active');
    const overBudget = projects.filter((p) => p.budget && p.spent > p.budget).length;
    const revenue = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
    const cost = projects.reduce((s, p) => s + p.spent, 0);
    return { active: active.length, overBudget, revenue, cost };
  }, [projects]);

  const columns: Column<Project>[] = [
    { key: 'code', header: 'Code', sortAccessor: (p) => p.code, render: (p) => <span className="nums font-medium text-brand-600">{p.code}</span> },
    { key: 'name', header: 'Project', sortAccessor: (p) => p.name, render: (p) => <div><p className="font-semibold text-content">{p.name}</p><p className="text-2xs text-content-subtle">{p.clientName}</p></div> },
    { key: 'manager', header: 'Manager', render: (p) => <div className="flex items-center gap-2"><Avatar name={p.managerName} size="xs" /><span className="text-sm">{p.managerName}</span></div> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'billing', header: 'Billing', render: (p) => <span className="text-content-muted">{p.billingModel}</span> },
    { key: 'budget', header: 'Budget', align: 'right', render: (p) => <span className="nums">{p.budget ? money(p.budget) : 'N/A'}</span> },
    { key: 'spent', header: 'Spent', align: 'right', sortAccessor: (p) => p.spent, render: (p) => <div className="min-w-[120px]"><div className="mb-1 flex justify-between text-2xs"><span className="nums text-content-muted">{money(p.spent)}</span>{p.budget && <span className="nums">{spentPct(p)}%</span>}</div>{p.budget && <ProgressBar value={spentPct(p)} autoTone size="sm" />}</div> },
    { key: 'margin', header: 'Margin', align: 'right', render: (p) => { const m = (p.budget ?? p.spent) - p.spent; return <span className={cn('nums font-medium', m >= 0 ? 'text-success-strong' : 'text-danger')}>{money(m)}</span>; } },
    { key: 'end', header: 'End Date', render: (p) => formatDate(p.endDate) },
  ];

  return (
    <div>
      <PageHeader title="Projects" description="All projects across all clients." actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>New Project</Button>} />

      <KpiStrip cols={4}>
        <KPICard label="Active Projects" value={kpis.active} format={(n) => String(Math.round(n))} icon={FolderKanban} tone="brand" loading={isLoading} />
        <KPICard label="Over Budget" value={kpis.overBudget} format={(n) => String(Math.round(n))} icon={AlertTriangle} tone={kpis.overBudget > 0 ? 'danger' : 'success'} loading={isLoading} />
        <KPICard label="This Month Revenue" value={kpis.revenue} format={(n) => money(n, { compact: true })} icon={TrendingUp} tone="success" loading={isLoading} />
        <KPICard label="This Month Cost" value={kpis.cost} format={(n) => money(n, { compact: true })} icon={TrendingDown} tone="warning" loading={isLoading} />
      </KpiStrip>

      <div className="mb-4 flex items-center justify-between">
        <SegmentedControl value={view} onChange={setView} segments={[{ value: 'list', label: 'List', icon: List }, { value: 'board', label: 'Board', icon: KanbanSquare }]} />
      </div>

      <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search project, client, manager…" activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-32" value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })} options={[{ value: '', label: 'Status' }, ...STATUSES.map((s) => ({ value: s, label: s }))]} />
        <Select sizeVariant="sm" className="w-32" value={values.billingModel ?? ''} onChange={(e) => set({ billingModel: e.target.value })} options={[{ value: '', label: 'Billing' }, ...['Fixed', 'T&M', 'Retainer'].map((b) => ({ value: b, label: b }))]} />
      </FilterBar>

      {view === 'list' ? (
        <DataTable data={projects} columns={columns} rowKey={(p) => p.id} loading={isLoading} sort={sort} onSortChange={setSort} onRowClick={(p) => navigate(routes.project(p.id))}
          empty={<EmptyState icon={FolderKanban} title="No projects" description="Create your first project." action={<Button icon={Plus} onClick={() => setAddOpen(true)}>New Project</Button>} />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((col) => {
            const items = projects.filter((p) => p.status === col);
            return (
              <div key={col}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { const id = e.dataTransfer.getData('id'); if (id) { update.mutate({ id, data: { status: col } }); toast.success(`Moved to ${col}`); } }}
                className="rounded-xl border border-line bg-surface-sunken/40 p-2">
                <div className="px-2 py-1.5 text-sm font-semibold text-content">{col} <span className="nums text-2xs text-content-subtle">({items.length})</span></div>
                <Stagger className="flex min-h-[60px] flex-col gap-2 p-1">
                  {items.map((p) => (
                    <Stagger.Item key={p.id}>
                      <div draggable onDragStart={(e) => e.dataTransfer.setData('id', p.id)} onClick={() => navigate(routes.project(p.id))}
                        className="cursor-grab rounded-lg border border-line bg-surface p-3 shadow-sm hover:shadow-md active:cursor-grabbing">
                        <p className="text-sm font-medium text-content">{p.name}</p>
                        <p className="mb-2 text-2xs text-content-subtle">{p.clientName}</p>
                        {p.budget && <ProgressBar value={spentPct(p)} autoTone size="sm" />}
                        <div className="mt-2 flex items-center justify-between"><Avatar name={p.managerName} size="xs" /><span className="nums text-2xs text-content-subtle">{money(p.spent, { compact: true })}</span></div>
                      </div>
                    </Stagger.Item>
                  ))}
                </Stagger>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
