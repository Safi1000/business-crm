import { useNavigate } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { PageHeader, FilterBar } from '@/shared';
import { Select, Card } from '@ds/primitives';
import { StatusBadge, ProgressBar, Avatar } from '@ds/data-display';
import { EmptyState, Skeleton } from '@ds/feedback';
import { Stagger } from '@ds/motion';
import { formatDate } from '@/lib/format';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useMyProjects } from '../hooks';
import { routes } from '@/config/routes';

export function ClientProjects() {
  const navigate = useNavigate();
  const { values, set, reset, activeCount } = useUrlFilters({ status: '' });
  const { data, isLoading } = useMyProjects();
  const projects = (data?.rows ?? []).filter((p) => !values.status || p.status === values.status);

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div>
      <PageHeader title="Projects" description="Your active and completed engagements." />
      <FilterBar activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-36" value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })} options={[{ value: '', label: 'All' }, ...['Active', 'Completed', 'On Hold'].map((s) => ({ value: s, label: s }))]} />
      </FilterBar>
      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects" description="You have no projects yet." />
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Stagger.Item key={p.id}>
              <Card interactive onClick={() => navigate(routes.cpProject(p.id))}>
                <div className="mb-2 flex items-center justify-between"><p className="font-semibold text-content">{p.name}</p><StatusBadge status={p.status} size="sm" /></div>
                <p className="mb-3 text-xs text-content-muted">{formatDate(p.startDate)} → {formatDate(p.endDate)}</p>
                <ProgressBar value={p.budget ? Math.min(100, Math.round((p.spent / p.budget) * 100)) : 50} />
                <div className="mt-3 flex items-center gap-2"><Avatar name={p.managerName} size="xs" /><span className="text-xs text-content-muted">{p.managerName}</span></div>
              </Card>
            </Stagger.Item>
          ))}
        </Stagger>
      )}
    </div>
  );
}

export function ClientProjectDetail() {
  const navigate = useNavigate();
  const { data } = useMyProjects();
  const id = window.location.pathname.split('/').pop();
  const project = data?.rows.find((p) => p.id === id);
  if (!project) return <EmptyState icon={FolderKanban} title="Project not found" />;

  const milestones = [
    { label: 'Kickoff & Discovery', status: 'Done' },
    { label: 'Design & Prototype', status: 'Done' },
    { label: 'Build & Integration', status: 'In Progress' },
    { label: 'UAT & Launch', status: 'Upcoming' },
  ];

  return (
    <div>
      <button onClick={() => navigate(routes.cpProjects)} className="mb-3 text-sm text-content-muted hover:text-content">← Back to Projects</button>
      <PageHeader title={<span className="flex items-center gap-3">{project.name}<StatusBadge status={project.status} /></span>} description={project.code} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 font-semibold text-content">Milestones</p>
          <ol className="relative space-y-4 border-l-2 border-line pl-6">
            {milestones.map((m, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[1.65rem] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${m.status === 'Done' ? 'bg-success' : m.status === 'In Progress' ? 'bg-brand-500' : 'bg-ink-300'}`} />
                <p className="font-medium text-content">{m.label}</p>
                <StatusBadge status={m.status} size="sm" />
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <p className="mb-4 font-semibold text-content">Project Info</p>
          <dl className="space-y-3 text-sm">
            {[['Start', formatDate(project.startDate)], ['Expected End', formatDate(project.endDate)], ['Billing', project.billingModel], ['Manager', project.managerName]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-content-muted">{k}</dt><dd className="font-medium text-content">{v}</dd></div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
