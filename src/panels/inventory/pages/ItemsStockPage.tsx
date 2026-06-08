import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Boxes, AlertTriangle, Coins, MapPin, ClipboardCheck } from 'lucide-react';
import { PageHeader, KpiStrip, FilterBar, useFormatMoney } from '@/shared';
import { Button, Select, Input, FormField } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, Pagination, type Column, type SortState } from '@ds/data-display';
import { EmptyState, Modal, toast } from '@ds/feedback';
import { cn } from '@/lib/cn';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useItems, useInventoryMutations } from '../hooks';
import type { Item } from '@/types';

const PAGE_SIZE = 25;
const CATEGORIES = ['Electronics', 'Accessories', 'Stationery', 'Consumables', 'Furniture'];

function AddItemModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addItem } = useInventoryMutations();
  const { register, handleSubmit, reset } = useForm<{ name: string; sku: string; category: string; unit: string; stock: number; reorderLevel: number; costPrice: number; salePrice: number }>({ defaultValues: { category: 'Electronics', unit: 'unit' } });
  return (
    <Modal open={open} onClose={onClose} title="Add Item" size="md"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={addItem.isPending} onClick={handleSubmit(async (v) => { await addItem.mutateAsync({ ...v, stock: Number(v.stock), reorderLevel: Number(v.reorderLevel), costPrice: Number(v.costPrice), salePrice: Number(v.salePrice), locations: [] }); toast.success('Item added'); reset(); onClose(); })}>Add Item</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" required className="sm:col-span-2"><Input {...register('name')} /></FormField>
        <FormField label="SKU"><Input placeholder="Auto" {...register('sku')} /></FormField>
        <FormField label="Category"><Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} {...register('category')} /></FormField>
        <FormField label="Unit"><Input placeholder="unit" {...register('unit')} /></FormField>
        <FormField label="Opening Stock"><Input type="number" {...register('stock')} /></FormField>
        <FormField label="Reorder Level"><Input type="number" {...register('reorderLevel')} /></FormField>
        <FormField label="Cost Price"><Input type="number" {...register('costPrice')} /></FormField>
        <FormField label="Sale Price"><Input type="number" {...register('salePrice')} /></FormField>
      </div>
    </Modal>
  );
}

function StocktakeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useItems({ pageSize: 1000 });
  const { addMovement } = useInventoryMutations();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const items = data?.rows ?? [];

  const save = async () => {
    const adjustments = items.filter((i) => counts[i.id] !== undefined && counts[i.id] !== i.stock);
    for (const i of adjustments) {
      await addMovement.mutateAsync({ itemId: i.id, type: 'Stocktake', quantity: counts[i.id]! - i.stock, reference: 'Stocktake' });
    }
    toast.success(`${adjustments.length} adjustment${adjustments.length === 1 ? '' : 's'} applied`);
    setCounts({});
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Stocktake" description="Enter counted quantities; differences post as adjustments." size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={addMovement.isPending} onClick={save}>Apply Adjustments</Button></>}>
      <div className="max-h-[55vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-line text-left text-2xs uppercase tracking-wide text-content-subtle"><th className="py-2">Item</th><th className="py-2 text-right">System</th><th className="py-2 text-right">Counted</th><th className="py-2 text-right">Diff</th></tr></thead>
          <tbody>
            {items.map((i) => {
              const counted = counts[i.id];
              const diff = counted === undefined ? 0 : counted - i.stock;
              return (
                <tr key={i.id} className="border-b border-line last:border-0">
                  <td className="py-2"><p className="font-medium text-content">{i.name}</p><p className="nums text-2xs text-content-subtle">{i.sku}</p></td>
                  <td className="nums py-2 text-right">{i.stock}</td>
                  <td className="py-2 text-right"><Input sizeVariant="sm" type="number" className="w-20 text-right" value={counted ?? ''} onChange={(e) => setCounts((c) => ({ ...c, [i.id]: Number(e.target.value) }))} /></td>
                  <td className={cn('nums py-2 text-right font-medium', diff > 0 ? 'text-success-strong' : diff < 0 ? 'text-danger' : 'text-content-subtle')}>{diff > 0 ? '+' : ''}{diff || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

export function ItemsStockPage() {
  const money = useFormatMoney();
  const [addOpen, setAddOpen] = useState(false);
  const [stocktakeOpen, setStocktakeOpen] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: 'name', dir: 'asc' });
  const { values, set, reset, activeCount } = useUrlFilters({ search: '', category: '', stockStatus: '', page: '1' });
  const page = Number(values.page) || 1;
  const { data, isLoading } = useItems({ search: values.search, category: values.category, stockStatus: values.stockStatus as ItemStatus, page, pageSize: PAGE_SIZE, sortKey: sort.key, sortDir: sort.dir });
  const { data: all } = useItems({ pageSize: 1000 });

  const kpis = useMemo(() => {
    const rows = all?.rows ?? [];
    const belowReorder = rows.filter((i) => i.stock <= i.reorderLevel).length;
    const value = rows.reduce((s, i) => s + i.stock * i.costPrice, 0);
    const locs = new Set(rows.flatMap((i) => i.locations.map((l) => l.location)));
    return { skus: rows.length, belowReorder, value, locations: locs.size };
  }, [all]);

  const columns: Column<Item>[] = [
    { key: 'sku', header: 'SKU', sortAccessor: (i) => i.sku, render: (i) => <span className="nums font-medium text-brand-600">{i.sku}</span> },
    { key: 'name', header: 'Name', sortAccessor: (i) => i.name, render: (i) => <span className="font-medium text-content">{i.name}</span> },
    { key: 'category', header: 'Category', render: (i) => <span className="text-content-muted">{i.category}</span> },
    { key: 'unit', header: 'Unit', render: (i) => i.unit },
    { key: 'stock', header: 'Stock', align: 'right', sortAccessor: (i) => i.stock, render: (i) => <span className={cn('nums font-medium', i.stock <= i.reorderLevel && 'text-danger')}>{i.stock}{i.stock <= i.reorderLevel && <span className="ml-1 text-2xs">(low)</span>}</span> },
    { key: 'cost', header: 'Cost', align: 'right', render: (i) => <span className="nums">{money(i.costPrice)}</span> },
    { key: 'sale', header: 'Sale', align: 'right', render: (i) => <span className="nums">{money(i.salePrice)}</span> },
    { key: 'locations', header: 'Locations', render: (i) => <span className="text-2xs text-content-muted">{i.locations.map((l) => `${l.location.split(' ')[0]}: ${l.qty}`).join(' · ') || '—'}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.stock === 0 ? 'Out' : i.stock <= i.reorderLevel ? 'Low' : 'In Stock'} tone={i.stock === 0 ? 'danger' : i.stock <= i.reorderLevel ? 'warning' : 'success'} size="sm" /> },
  ];

  return (
    <div>
      <PageHeader title="Items & Stock" description="Master list of items with current stock levels per location." actions={<><Button variant="outline" icon={ClipboardCheck} onClick={() => setStocktakeOpen(true)}>Stocktake</Button><Button icon={Plus} onClick={() => setAddOpen(true)}>Add Item</Button></>} />

      <KpiStrip cols={4}>
        <KPICard label="Total SKUs" value={kpis.skus} format={(n) => String(Math.round(n))} icon={Boxes} tone="brand" loading={isLoading} />
        <KPICard label="Below Reorder" value={kpis.belowReorder} format={(n) => String(Math.round(n))} icon={AlertTriangle} tone={kpis.belowReorder > 0 ? 'danger' : 'success'} loading={isLoading} />
        <KPICard label="Total Stock Value" value={kpis.value} format={(n) => money(n, { compact: true })} icon={Coins} tone="success" loading={isLoading} />
        <KPICard label="Locations" value={kpis.locations} format={(n) => String(Math.round(n))} icon={MapPin} tone="info" loading={isLoading} />
      </KpiStrip>

      <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search SKU, name…" activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-40" value={values.category ?? ''} onChange={(e) => set({ category: e.target.value })} options={[{ value: '', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
        <Select sizeVariant="sm" className="w-32" value={values.stockStatus ?? ''} onChange={(e) => set({ stockStatus: e.target.value })} options={[{ value: '', label: 'All Stock' }, { value: 'In Stock', label: 'In Stock' }, { value: 'Low', label: 'Low' }, { value: 'Out', label: 'Out' }]} />
      </FilterBar>

      <DataTable data={data?.rows ?? []} columns={columns} rowKey={(i) => i.id} loading={isLoading} sort={sort} onSortChange={setSort}
        empty={<EmptyState icon={Boxes} title="No items" description="Add your first item to track stock." action={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add Item</Button>} />} />

      {data && data.total > 0 && <div className="mt-4"><Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={(p) => set({ page: String(p) })} /></div>}

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} />
      <StocktakeModal open={stocktakeOpen} onClose={() => setStocktakeOpen(false)} />
    </div>
  );
}

type ItemStatus = '' | 'In Stock' | 'Low' | 'Out';
