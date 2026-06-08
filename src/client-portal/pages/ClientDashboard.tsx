import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Receipt, FolderKanban, FileSignature } from 'lucide-react';
import { KpiStrip, useFormatMoney } from '@/shared';
import { Card, CardHeader, CardTitle, Button } from '@ds/primitives';
import { KPICard, StatusBadge, ProgressBar, DataTable, type Column } from '@ds/data-display';
import { EmptyState } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { useMyClient, useMyInvoices, useMyContracts, useMyProjects } from '../hooks';
import { routes } from '@/config/routes';
import type { Invoice } from '@/types';

export function ClientDashboard() {
  const navigate = useNavigate();
  const money = useFormatMoney();
  const { data: client } = useMyClient();
  const { data: invoices = [], isLoading } = useMyInvoices();
  const { data: contracts = [] } = useMyContracts();
  const { data: projects } = useMyProjects();

  const stats = useMemo(() => {
    const outstanding = invoices.reduce((s, i) => s + (i.total - i.received), 0);
    const ytd = invoices.length;
    const ytdSum = invoices.reduce((s, i) => s + i.total, 0);
    return { outstanding, ytd, ytdSum, activeProjects: projects?.rows.filter((p) => p.status === 'Active').length ?? 0, activeContracts: contracts.filter((c) => c.status === 'Active').length };
  }, [invoices, contracts, projects]);

  const recentCols: Column<Invoice>[] = [
    { key: 'number', header: 'Invoice #', render: (i) => <span className="nums font-medium text-brand-600">{i.number}</span> },
    { key: 'date', header: 'Date', render: (i) => formatDate(i.issueDate) },
    { key: 'amount', header: 'Amount', align: 'right', render: (i) => <span className="nums">{money(i.total)}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    { key: 'action', header: '', align: 'right', render: (i) => <Button size="sm" variant="ghost" onClick={() => navigate(routes.cpInvoice(i.id))}>View</Button> },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {client?.name ?? 'Client'}</h1>
          <p className="mt-1 text-sm text-white/80">{formatDate(new Date())}</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.outstanding > 0 && (
            <div className="rounded-xl bg-white/15 px-4 py-2 text-right">
              <p className="text-2xs text-white/80">Outstanding</p>
              <p className="nums text-lg font-bold">{money(stats.outstanding)}</p>
            </div>
          )}
          <Button variant="secondary" className="bg-white text-brand-700 hover:bg-white/90" onClick={() => navigate(`${routes.cpInvoices}?status=Unpaid`)}>Pay Now</Button>
        </div>
      </div>

      <KpiStrip cols={4}>
        <KPICard label="Outstanding Balance" value={stats.outstanding} format={(n) => money(n, { compact: true })} icon={Wallet} tone="danger" onClick={() => navigate(routes.cpInvoices)} loading={isLoading} />
        <KPICard label="Invoices This Year" value={stats.ytd} format={(n) => String(Math.round(n))} icon={Receipt} tone="brand" onClick={() => navigate(routes.cpInvoices)} />
        <KPICard label="Active Projects" value={stats.activeProjects} format={(n) => String(Math.round(n))} icon={FolderKanban} tone="info" onClick={() => navigate(routes.cpProjects)} />
        <KPICard label="Active Contracts" value={stats.activeContracts} format={(n) => String(Math.round(n))} icon={FileSignature} tone="success" onClick={() => navigate(routes.cpContracts)} />
      </KpiStrip>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none">
            <div className="flex items-center justify-between p-5 pb-3">
              <CardTitle>Recent Invoices</CardTitle>
              <Link to={routes.cpInvoices} className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>
            </div>
            <DataTable data={invoices.slice(0, 5)} columns={recentCols} rowKey={(i) => i.id} loading={isLoading} onRowClick={(i) => navigate(routes.cpInvoice(i.id))}
              empty={<EmptyState icon={Receipt} title="No invoices yet" description="Your service provider will send the first one soon." size="sm" />} />
          </Card>

          {projects && projects.rows.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.rows.filter((p) => p.status === 'Active').slice(0, 4).map((p) => (
                  <div key={p.id} className="rounded-xl border border-line p-4">
                    <div className="mb-2 flex items-center justify-between"><p className="font-medium text-content">{p.name}</p><StatusBadge status={p.status} size="sm" /></div>
                    <ProgressBar value={p.budget ? Math.min(100, Math.round((p.spent / p.budget) * 100)) : 50} />
                    <button onClick={() => navigate(routes.cpProject(p.id))} className="mt-2 text-xs font-medium text-brand-600 hover:underline">View</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card padding="md">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <ol className="space-y-3 text-sm">
            {[
              `Invoice ${invoices[0]?.number ?? 'INV-0001'} issued`,
              `Payment of ${money(50000)} received against ${invoices[1]?.number ?? 'INV-0002'}`,
              `Contract ${contracts[0]?.code ?? 'CON-0001'} expires in 30 days`,
            ].map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <span className="text-content">{t}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
