import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Banknote, Wallet, AlertCircle, Download, CreditCard } from 'lucide-react';
import { PageHeader, KpiStrip, FilterBar, useFormatMoney } from '@/shared';
import { Button, Select } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, DateBadge, type Column } from '@ds/data-display';
import { EmptyState, toast } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useMyInvoices } from '../hooks';
import { PaymentModal } from '../PaymentModal';
import { routes } from '@/config/routes';
import type { Invoice } from '@/types';

export function ClientInvoices() {
  const navigate = useNavigate();
  const money = useFormatMoney();
  const { values, set, reset, activeCount } = useUrlFilters({ search: '', status: '' });
  const { data: invoices = [], isLoading } = useMyInvoices();
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((i) =>
    (!values.search || i.number.toLowerCase().includes(values.search.toLowerCase())) &&
    (!values.status || (values.status === 'Unpaid' ? i.status !== 'Paid' : i.status === values.status)),
  );

  const kpis = useMemo(() => {
    const invoiced = invoices.reduce((s, i) => s + i.total, 0);
    const paid = invoices.reduce((s, i) => s + i.received, 0);
    const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + (i.total - i.received), 0);
    return { invoiced, paid, outstanding: invoiced - paid, overdue };
  }, [invoices]);

  const columns: Column<Invoice>[] = [
    { key: 'number', header: 'Invoice #', render: (i) => <span className="nums font-medium text-brand-600">{i.number}</span> },
    { key: 'issue', header: 'Issue Date', render: (i) => formatDate(i.issueDate) },
    { key: 'due', header: 'Due Date', render: (i) => <span className="flex items-center gap-2">{formatDate(i.dueDate)}{i.status === 'Overdue' && <DateBadge date={i.dueDate} />}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (i) => <span className="nums font-medium">{money(i.total)}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (i) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon={Download} aria-label="Download" onClick={() => toast.success(`${i.number}.pdf downloaded`)} />
          {i.status !== 'Paid' && <Button size="sm" variant="subtle" icon={CreditCard} onClick={() => setPayInvoice(i)}>Pay Now</Button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Invoices" description="Every invoice issued to you." />
      <KpiStrip cols={4}>
        <KPICard label="Total Invoiced (YTD)" value={kpis.invoiced} format={(n) => money(n, { compact: true })} icon={Receipt} tone="brand" />
        <KPICard label="Paid (YTD)" value={kpis.paid} format={(n) => money(n, { compact: true })} icon={Banknote} tone="success" />
        <KPICard label="Outstanding" value={kpis.outstanding} format={(n) => money(n, { compact: true })} icon={Wallet} tone="warning" />
        <KPICard label="Overdue" value={kpis.overdue} format={(n) => money(n, { compact: true })} icon={AlertCircle} tone="danger" />
      </KpiStrip>
      <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search invoice #…" activeCount={activeCount} onReset={reset}>
        <Select sizeVariant="sm" className="w-32" value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })} options={[{ value: '', label: 'All' }, { value: 'Unpaid', label: 'Unpaid' }, { value: 'Paid', label: 'Paid' }, { value: 'Overdue', label: 'Overdue' }]} />
      </FilterBar>
      <DataTable data={filtered} columns={columns} rowKey={(i) => i.id} loading={isLoading} onRowClick={(i) => navigate(routes.cpInvoice(i.id))}
        empty={<EmptyState icon={Receipt} title="No invoices yet" description="Your service provider will send the first one soon." />} />
      <PaymentModal invoice={payInvoice} onClose={() => setPayInvoice(null)} />
    </div>
  );
}
