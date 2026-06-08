import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Sigma } from 'lucide-react';
import { PageHeader, KpiStrip, FilterBar } from '@/shared';
import { Button, Select, Input, FormField } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, Pagination, type Column, type SortState } from '@ds/data-display';
import { EmptyState, Modal, toast } from '@ds/feedback';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useMovements, useItems, useInventoryMutations } from '../hooks';
import type { MovementType, StockMovement } from '@/types';

const PAGE_SIZE = 25;
const TYPES: MovementType[] = ['In', 'Out', 'Adjustment', 'Stocktake'];
const LOCATIONS = ['Karachi Warehouse', 'Lahore Store', 'Islamabad Store'];

function NewMovementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: items } = useItems({ pageSize: 1000 });
  const { addMovement } = useInventoryMutations();
  const { register, handleSubmit, reset, watch } = useForm<{ itemId: string; type: MovementType; quantity: number; location: string; reference: string }>({ defaultValues: { type: 'In' } });
  const type = watch('type');
  return (
    <Modal open={open} onClose={onClose} title="New Movement" size="md"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={addMovement.isPending} onClick={handleSubmit(async (v) => {
        const qty = v.type === 'Out' ? -Math.abs(Number(v.quantity)) : Number(v.quantity);
        await addMovement.mutateAsync({ itemId: v.itemId, type: v.type, quantity: qty, reference: v.reference, fromLocation: v.type === 'Out' ? v.location : undefined, toLocation: v.type === 'In' ? v.location : undefined });
        toast.success('Movement recorded'); reset(); onClose();
      })}>Record</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Item" required className="sm:col-span-2"><Select placeholder="Select item…" options={(items?.rows ?? []).map((i) => ({ value: i.id, label: `${i.sku} — ${i.name}` }))} {...register('itemId')} /></FormField>
        <FormField label="Type"><Select options={TYPES.map((t) => ({ value: t, label: t }))} {...register('type')} /></FormField>
        <FormField label="Quantity"><Input type="number" {...register('quantity')} /></FormField>
        <FormField label={type === 'In' ? 'To Location' : 'From Location'}><Select options={LOCATIONS.map((l) => ({ value: l, label: l }))} {...register('location')} /></FormField>
        <FormField label="Reference"><Input placeholder="PO-1234" {...register('reference')} /></FormField>
      </div>
    </Modal>
  );
}

export function StockMovementsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: 'date', dir: 'desc' });
  const { values, set, reset, activeCount } = useUrlFilters({ search: '', type: '', location: '', page: '1' });
  const page = Number(values.page) || 1;
  const { data, isLoading } = useMovements({ search: values.search, type: values.type, location: values.location, page, pageSize: PAGE_SIZE, sortKey: sort.key, sortDir: sort.dir });
  const { data: all } = useMovements({ pageSize: 1000 });

  const kpis = useMemo(() => {
    const rows = all?.rows ?? [];
    const stockIn = rows.filter((m) => m.quantity > 0).reduce((s, m) => s + m.quantity, 0);
    const stockOut = rows.filter((m) => m.quantity < 0).reduce((s, m) => s + Math.abs(m.quantity), 0);
    return { count: rows.length, stockIn, stockOut, net: stockIn - stockOut };
  }, [all]);

  const columns: Column<StockMovement>[] = [
    { key: 'date', header: 'Date', sortAccessor: (m) => m.date, render: (m) => formatDate(m.date) },
    { key: 'type', header: 'Type', render: (m) => <StatusBadge status={m.type} dot={false} size="sm" tone={m.type === 'In' ? 'success' : m.type === 'Out' ? 'danger' : 'neutral'} /> },
    { key: 'item', header: 'Item', render: (m) => <div><p className="font-medium text-content">{m.itemName}</p><p className="nums text-2xs text-content-subtle">{m.sku}</p></div> },
    { key: 'qty', header: 'Quantity', align: 'right', sortAccessor: (m) => m.quantity, render: (m) => <span className={cn('nums font-medium', m.quantity > 0 ? 'text-success-strong' : 'text-danger')}>{m.quantity > 0 ? '+' : ''}{m.quantity}</span> },
    { key: 'from', header: 'From', render: (m) => <span className="text-content-muted">{m.fromLocation ?? '—'}</span> },
    { key: 'to', header: 'To', render: (m) => <span className="text-content-muted">{m.toLocation ?? '—'}</span> },
    { key: 'ref', header: 'Reference', render: (m) => <span className="nums text-content-muted">{m.reference ?? '—'}</span> },
    { key: 'user', header: 'User', render: (m) => m.user },
  ];

  return (
    <div>
      <PageHeader title="Stock Movements" description="Every change in stock as an immutable log." actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>New Movement</Button>} />

      <KpiStrip cols={4}>
        <KPICard label="Movements This Month" value={kpis.count} format={(n) => String(Math.round(n))} icon={ArrowLeftRight} tone="brand" loading={isLoading} />
        <KPICard label="Stock In" value={kpis.stockIn} format={(n) => String(Math.round(n))} icon={ArrowDownToLine} tone="success" loading={isLoading} />
        <KPICard label="Stock Out" value={kpis.stockOut} format={(n) => String(Math.round(n))} icon={ArrowUpFromLine} tone="warning" loading={isLoading} />
        <KPICard label="Net Change" value={kpis.net} format={(n) => String(Math.round(n))} icon={Sigma} tone="info" loading={isLoading} />
      </KpiStrip>

      <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search item, reference…" activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-36" value={values.type ?? ''} onChange={(e) => set({ type: e.target.value })} options={[{ value: '', label: 'All Types' }, ...TYPES.map((t) => ({ value: t, label: t }))]} />
        <Select sizeVariant="sm" className="w-44" value={values.location ?? ''} onChange={(e) => set({ location: e.target.value })} options={[{ value: '', label: 'All Locations' }, ...LOCATIONS.map((l) => ({ value: l, label: l }))]} />
      </FilterBar>

      <DataTable data={data?.rows ?? []} columns={columns} rowKey={(m) => m.id} loading={isLoading} sort={sort} onSortChange={setSort}
        empty={<EmptyState icon={ArrowLeftRight} title="No movements" description="Record a stock movement to start the log." action={<Button icon={Plus} onClick={() => setAddOpen(true)}>New Movement</Button>} />} />

      {data && data.total > 0 && <div className="mt-4"><Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={(p) => set({ page: String(p) })} /></div>}

      <NewMovementModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
