import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, Plus, Pencil } from 'lucide-react';
import { PageHeader } from '@/shared';
import { Button, Input, Card } from '@ds/primitives';
import { DataTable, StatusBadge, type Column } from '@ds/data-display';
import { EmptyState, toast } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { financeApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { FxRate } from '@/types';

export function FxRatesPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data: rates = [], isLoading, refetch, isFetching } = useQuery({ queryKey: qk.fx, queryFn: financeApi.fx });

  const columns: Column<FxRate>[] = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'base', header: 'Base Currency', render: (r) => <span className="nums font-medium">{r.base}</span> },
    { key: 'quote', header: 'Quote Currency', render: (r) => <span className="nums font-medium">{r.quote}</span> },
    { key: 'rate', header: 'Rate', align: 'right', render: (r) => <span className="nums">{r.rate.toFixed(4)}</span> },
    { key: 'source', header: 'Source', render: (r) => <StatusBadge status={r.source} dot={false} size="sm" tone={r.source === 'auto' ? 'info' : 'neutral'} /> },
    { key: 'actions', header: '', align: 'right', render: () => <Button size="sm" variant="ghost" icon={Pencil} onClick={() => toast.info('Override rate (stub)')}>Override</Button> },
  ];

  return (
    <div>
      <PageHeader
        title="FX Rates"
        description="Daily exchange rates against the presentation currency."
        actions={
          <>
            <Button variant="outline" icon={Plus} onClick={() => toast.info('Add currency pair (stub)')}>Add Pair</Button>
            <Button icon={RefreshCcw} loading={isFetching} onClick={() => { refetch(); toast.success('Refreshed from FX provider'); }}>Refresh from API</Button>
          </>
        }
      />

      <Card className="mb-4" padding="sm">
        <div className="flex items-center gap-3">
          <span className="text-sm text-content-muted">As of</span>
          <Input type="date" sizeVariant="sm" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
          <span className="text-2xs text-content-subtle">Base currency is your presentation currency (PKR).</span>
        </div>
      </Card>

      <DataTable data={rates} columns={columns} rowKey={(r) => r.id} loading={isLoading} empty={<EmptyState icon={RefreshCcw} title="No FX pairs" description="Add a currency pair to start tracking rates." />} />
    </div>
  );
}
