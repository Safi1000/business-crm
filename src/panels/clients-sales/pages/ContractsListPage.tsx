import { useMemo, useState } from 'react';
import { Plus, FileSignature, CalendarClock, Repeat, BarChart3, RefreshCw, Ban } from 'lucide-react';
import { PageHeader, KpiStrip, FilterBar, useFormatMoney } from '@/shared';
import { Button, Select, Toggle } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, DateBadge, Pagination, type Column, type SortState } from '@ds/data-display';
import { EmptyState, ConfirmDialog, toast } from '@ds/feedback';
import { formatDate, daysUntil } from '@/lib/format';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useContracts, useContractMutations } from '../hooks/useContracts';
import { ContractFormModal } from '../modals/ContractFormModal';
import type { Contract } from '@/types';

const PAGE_SIZE = 25;
const TYPES = ['Service Agreement', 'Retainer', 'Project'];

export function ContractsListPage() {
  const money = useFormatMoney();
  const { values, set, reset, activeCount } = useUrlFilters({ search: '', type: '', status: '', page: '1' });
  const [sort, setSort] = useState<SortState>({ key: 'endDate', dir: 'asc' });
  const [addOpen, setAddOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Contract | null>(null);
  const { renew, cancel, update } = useContractMutations();

  const page = Number(values.page) || 1;
  const { data, isLoading, isError, refetch } = useContracts({ search: values.search, type: values.type, status: values.status, page, pageSize: PAGE_SIZE, sortKey: sort.key, sortDir: sort.dir });
  const { data: all } = useContracts({ pageSize: 1000 });

  const kpis = useMemo(() => {
    const rows = all?.rows ?? [];
    const active = rows.filter((c) => c.status === 'Active');
    const expiring = active.filter((c) => { const d = daysUntil(c.endDate); return d >= 0 && d <= 90; }).length;
    const mrr = active.reduce((s, c) => s + (c.monthlyValue ?? 0), 0);
    const avg = active.length ? Math.round(active.reduce((s, c) => s + c.value, 0) / active.length) : 0;
    return { active: active.length, expiring, mrr, avg };
  }, [all]);

  const columns: Column<Contract>[] = [
    { key: 'code', header: 'Code', sortAccessor: (c) => c.code, render: (c) => <span className="nums font-medium text-brand-600">{c.code}</span> },
    { key: 'client', header: 'Client', sortAccessor: (c) => c.clientName, render: (c) => <span className="font-medium text-content">{c.clientName}</span> },
    { key: 'type', header: 'Type', render: (c) => <StatusBadge status={c.type} dot={false} size="sm" tone="neutral" /> },
    { key: 'start', header: 'Start', render: (c) => formatDate(c.startDate) },
    { key: 'end', header: 'End', sortAccessor: (c) => c.endDate, render: (c) => <span className="flex items-center gap-2">{formatDate(c.endDate)}{c.status === 'Active' && daysUntil(c.endDate) <= 90 && <DateBadge date={c.endDate} />}</span> },
    { key: 'value', header: 'Value', align: 'right', sortAccessor: (c) => c.value, render: (c) => <span className="nums font-medium">{money(c.value)}{c.monthlyValue ? <span className="text-2xs text-content-subtle"> /mo {money(c.monthlyValue)}</span> : null}</span> },
    { key: 'auto', header: 'Auto-invoice', align: 'center', render: (c) => <Toggle size="sm" checked={c.autoInvoice} onChange={async (next) => { await update.mutateAsync({ id: c.id, data: { autoInvoice: next } }); toast.success(next ? 'Auto-invoice on' : 'Auto-invoice off'); }} /> },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {c.status !== 'Cancelled' && <Button size="sm" variant="ghost" icon={RefreshCw} onClick={async () => { const next = new Date(c.endDate); next.setFullYear(next.getFullYear() + 1); await renew.mutateAsync({ id: c.id, endDate: next.toISOString().slice(0, 10) }); toast.success('Contract renewed'); }}>Renew</Button>}
          {c.status === 'Active' && <Button size="sm" variant="ghost" icon={Ban} onClick={() => setCancelTarget(c)}>Cancel</Button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Contracts / Retainers" description="Every contract in force across your clients." actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add Contract</Button>} />

      <KpiStrip cols={4}>
        <KPICard label="Active Contracts" value={kpis.active} format={(n) => String(Math.round(n))} icon={FileSignature} tone="brand" />
        <KPICard label="Expiring in 90 Days" value={kpis.expiring} format={(n) => String(Math.round(n))} icon={CalendarClock} tone={kpis.expiring > 0 ? 'warning' : 'success'} />
        <KPICard label="Monthly Recurring Rev." value={kpis.mrr} format={(n) => money(n, { compact: true })} icon={Repeat} tone="success" />
        <KPICard label="Avg Contract Value" value={kpis.avg} format={(n) => money(n, { compact: true })} icon={BarChart3} tone="info" />
      </KpiStrip>

      <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search code, client…" activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-44" value={values.type ?? ''} onChange={(e) => set({ type: e.target.value })} options={[{ value: '', label: 'All Types' }, ...TYPES.map((t) => ({ value: t, label: t }))]} />
        <Select sizeVariant="sm" className="w-32" value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })} options={[{ value: '', label: 'All Status' }, ...['Active', 'Expired', 'Cancelled'].map((s) => ({ value: s, label: s }))]} />
      </FilterBar>

      <DataTable data={data?.rows ?? []} columns={columns} rowKey={(c) => c.id} loading={isLoading} error={isError} onRetry={() => refetch()} sort={sort} onSortChange={setSort}
        empty={<EmptyState icon={FileSignature} title="No contracts" description="Add a contract to start tracking recurring revenue." action={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add Contract</Button>} />} />

      {data && data.total > 0 && <div className="mt-4"><Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={(p) => set({ page: String(p) })} /></div>}

      <ContractFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ConfirmDialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel this contract?" message={`${cancelTarget?.code} will be marked Cancelled.`} confirmLabel="Cancel Contract" onConfirm={async () => { if (cancelTarget) { await cancel.mutateAsync(cancelTarget.id); toast.success('Contract cancelled'); } }} />
    </div>
  );
}
