import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, AlertTriangle, CalendarClock, BellRing, Plus, Pencil, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, KpiStrip, FilterBar } from '@/shared';
import { Button, Tabs, Select, Input, FormField, SegmentedControl, type TabItem } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, type Column } from '@ds/data-display';
import { EmptyState, Modal, ConfirmDialog, toast } from '@ds/feedback';
import { cn } from '@/lib/cn';
import { formatDate, daysUntil } from '@/lib/format';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useImportantDates, useDateMutations } from '../hooks';
import type { DateCategory, ImportantDate, DatePriority } from '@/types';

const CATEGORIES: DateCategory[] = ['Tax', 'Licence', 'Contract', 'Insurance', 'Other'];
const CATEGORY_COLOR: Record<DateCategory, string> = {
  Tax: '#dc2626', Licence: '#2563eb', Contract: '#7c3aed', Insurance: '#0d9488', Other: '#64748b',
};

function DaysRemaining({ date }: { date: string }) {
  const d = daysUntil(date);
  const tone = d < 0 ? 'text-danger' : d <= 7 ? 'text-danger' : d <= 30 ? 'text-warning-strong' : 'text-content-muted';
  return <span className={cn('nums font-medium', tone)}>{d < 0 ? `${Math.abs(d)}d overdue` : `${d}d`}</span>;
}

function DateFormModal({ open, onClose, date }: { open: boolean; onClose: () => void; date?: ImportantDate }) {
  const { create, update } = useDateMutations();
  const { register, handleSubmit, reset } = useForm<{ title: string; date: string; category: DateCategory; priority: DatePriority; advanceNoticeDays: number }>({
    defaultValues: date ?? { category: 'Tax', priority: 'High', advanceNoticeDays: 14, date: new Date().toISOString().slice(0, 10) },
  });
  return (
    <Modal open={open} onClose={onClose} title={date ? 'Edit Important Date' : 'Add Important Date'} size="md"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={create.isPending || update.isPending} onClick={handleSubmit(async (v) => { if (date) { await update.mutateAsync({ id: date.id, data: { ...v, advanceNoticeDays: Number(v.advanceNoticeDays) } }); toast.success('Date updated'); } else { await create.mutateAsync({ ...v, advanceNoticeDays: Number(v.advanceNoticeDays) }); toast.success('Date added'); } reset(); onClose(); })}>Save</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" required className="sm:col-span-2"><Input placeholder="Sales Tax Return Filing" {...register('title')} /></FormField>
        <FormField label="Date"><Input type="date" {...register('date')} /></FormField>
        <FormField label="Category"><Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} {...register('category')} /></FormField>
        <FormField label="Priority"><Select options={['Critical', 'High', 'Medium', 'Low'].map((p) => ({ value: p, label: p }))} {...register('priority')} /></FormField>
        <FormField label="Advance Notice (days)"><Input type="number" {...register('advanceNoticeDays')} /></FormField>
      </div>
    </Modal>
  );
}

function MiniCalendar({ dates }: { dates: ImportantDate[] }) {
  const [cursor, setCursor] = useState(new Date('2026-06-01'));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayItems = (day: number) => dates.filter((d) => { const dd = new Date(d.date); return dd.getFullYear() === year && dd.getMonth() === month && dd.getDate() === day; });

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
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const items = dayItems(day);
          return (
            <div key={day} className="min-h-[64px] rounded-lg border border-line p-1.5 text-left">
              <span className="nums text-xs text-content-muted">{day}</span>
              <div className="mt-1 flex flex-col gap-0.5">
                {items.slice(0, 2).map((it) => (
                  <span key={it.id} className="flex items-center gap-1 truncate text-2xs text-content" title={it.title}>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[it.category] }} />
                    <span className="truncate">{it.title}</span>
                  </span>
                ))}
                {items.length > 2 && <span className="text-2xs text-content-subtle">+{items.length - 2}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ImportantDatesPage() {
  const [tab, setTab] = useState('dates');
  const [view, setView] = useState('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ImportantDate | undefined>();
  const [confirmDel, setConfirmDel] = useState<ImportantDate | null>(null);
  const { values, set, reset, activeCount } = useUrlFilters({ search: '', category: '' });
  const { data: dates = [], isLoading } = useImportantDates({ search: values.search, category: values.category });
  const { update, remove } = useDateMutations();

  const kpis = useMemo(() => ({
    critical: dates.filter((d) => d.priority === 'Critical' && !d.completed).length,
    high: dates.filter((d) => d.priority === 'High' && !d.completed).length,
    upcoming: dates.filter((d) => !d.completed && daysUntil(d.date) >= 0 && daysUntil(d.date) <= 30).length,
    active: dates.filter((d) => !d.completed).length,
  }), [dates]);

  const columns: Column<ImportantDate>[] = [
    { key: 'title', header: 'Title', render: (d) => <span className={cn('font-medium', d.completed ? 'text-content-subtle line-through' : 'text-content')}>{d.title}</span> },
    { key: 'date', header: 'Date', render: (d) => formatDate(d.date) },
    { key: 'category', header: 'Category', render: (d) => <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[d.category] }} />{d.category}</span> },
    { key: 'days', header: 'Days Remaining', render: (d) => (d.completed ? <StatusBadge status="Completed" size="sm" /> : <DaysRemaining date={d.date} />) },
    { key: 'notice', header: 'Advance Notice', render: (d) => <span className="nums text-content-muted">{d.advanceNoticeDays}d</span> },
    { key: 'priority', header: 'Priority', render: (d) => <StatusBadge status={d.priority} dot tone={d.priority === 'Critical' ? 'danger' : d.priority === 'High' ? 'warning' : 'neutral'} size="sm" /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (d) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" icon={Check} aria-label="Complete" onClick={async () => { await update.mutateAsync({ id: d.id, data: { completed: !d.completed } }); toast.success(d.completed ? 'Reopened' : 'Marked complete'); }} />
          <Button size="sm" variant="ghost" icon={Pencil} aria-label="Edit" onClick={() => { setEditing(d); setModalOpen(true); }} />
          <Button size="sm" variant="ghost" icon={Trash2} aria-label="Delete" onClick={() => setConfirmDel(d)} />
        </div>
      ),
    },
  ];

  const tabs: TabItem[] = [
    { value: 'dates', label: 'Important Dates', count: dates.length },
    { value: 'active', label: 'Active Alerts', count: kpis.active },
    { value: 'recurring', label: 'Recurring Alerts', count: dates.filter((d) => d.recurring).length },
  ];

  const shown = tab === 'active' ? dates.filter((d) => !d.completed) : tab === 'recurring' ? dates.filter((d) => d.recurring) : dates;

  return (
    <div>
      <PageHeader
        title="Important Dates"
        description="Every deadline that matters — tax, licences, contracts, insurance."
        actions={<Button icon={Plus} onClick={() => { setEditing(undefined); setModalOpen(true); }}>Add Important Date</Button>}
      />

      <KpiStrip cols={4}>
        <KPICard label="Critical Alerts" value={kpis.critical} format={(n) => String(Math.round(n))} icon={AlertCircle} tone="danger" loading={isLoading} />
        <KPICard label="High Priority" value={kpis.high} format={(n) => String(Math.round(n))} icon={AlertTriangle} tone="warning" loading={isLoading} />
        <KPICard label="Upcoming (30d)" value={kpis.upcoming} format={(n) => String(Math.round(n))} icon={CalendarClock} tone="info" loading={isLoading} />
        <KPICard label="Active Alerts" value={kpis.active} format={(n) => String(Math.round(n))} icon={BellRing} tone="success" loading={isLoading} />
      </KpiStrip>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs items={tabs} value={tab} onChange={setTab} />
        <SegmentedControl value={view} onChange={setView} size="sm" segments={[{ value: 'table', label: 'Table' }, { value: 'calendar', label: 'Calendar' }]} />
      </div>

      {view === 'calendar' ? (
        <MiniCalendar dates={shown} />
      ) : (
        <>
          <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search deadlines…" activeCount={activeCount} onReset={reset}>
            <Select sizeVariant="sm" className="w-36" value={values.category ?? ''} onChange={(e) => set({ category: e.target.value })} options={[{ value: '', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
          </FilterBar>
          <DataTable data={shown} columns={columns} rowKey={(d) => d.id} loading={isLoading} empty={<EmptyState icon={CalendarClock} title="No important dates" description="Add a deadline to start tracking compliance." action={<Button icon={Plus} onClick={() => setModalOpen(true)}>Add Important Date</Button>} />} />
        </>
      )}

      <DateFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined); }} date={editing} />
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete this date?" message={`${confirmDel?.title} will be removed.`} confirmLabel="Delete" onConfirm={async () => { if (confirmDel) { await remove.mutateAsync(confirmDel.id); toast.success('Deleted'); } }} />
    </div>
  );
}
