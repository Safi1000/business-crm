import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCcw, Plus, Pencil } from 'lucide-react';
import { PageHeader } from '@/shared';
import { Button, Input, Card, Select, FormField } from '@ds/primitives';
import { DataTable, StatusBadge, type Column } from '@ds/data-display';
import { EmptyState, Modal, toast } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { financeApi, settingsApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { FxRate } from '@/types';

// Quote currencies offered for tracking (display labels only — not the app's formatting CurrencyCode union).
const CURRENCIES: string[] = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'CNY', 'JPY', 'CAD', 'AUD', 'CHF', 'INR', 'PKR'];

export function FxRatesPage() {
  const qc = useQueryClient();
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const { data: rates = [], isLoading } = useQuery({ queryKey: qk.fx, queryFn: financeApi.fx });
  const { data: company } = useQuery({ queryKey: ['company-profile'], queryFn: settingsApi.company });
  const base = (company?.presentationCurrency ?? 'PKR') as string;

  const [refreshing, setRefreshing] = useState(false);
  // Manual override modal (rate fixed against the presentation currency).
  const [override, setOverride] = useState<{ quote: string; rate: string } | null>(null);
  // Add-pair modal (just pick a quote currency; its rate is fetched live).
  const [addQuote, setAddQuote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const tracked = useMemo(() => new Set<string>(rates.map((r) => r.quote)), [rates]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await financeApi.fxRefresh();
      await qc.invalidateQueries({ queryKey: qk.fx });
      const n = res.updated.length;
      toast.success(n ? `Updated ${n} rate${n === 1 ? '' : 's'} from live providers` : 'Rates already up to date');
      if (res.unsupported?.length) toast.error(`No live rate available for: ${res.unsupported.join(', ')}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not refresh rates');
    } finally {
      setRefreshing(false);
    }
  };

  const saveOverride = async () => {
    if (!override) return;
    // Validate date and rate before saving (was previously unvalidated).
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      toast.error('Enter a valid date');
      return;
    }
    if (date > todayStr) {
      toast.error('Date cannot be in the future');
      return;
    }
    const rate = Number(override.rate);
    if (!override.rate || !Number.isFinite(rate) || rate <= 0) {
      toast.error('Enter a rate greater than zero');
      return;
    }
    setSaving(true);
    try {
      await financeApi.fxOverride(base, override.quote, rate, date);
      await qc.invalidateQueries({ queryKey: qk.fx });
      toast.success('Rate overridden');
      setOverride(null);
    } catch {
      toast.error('Could not save rate');
    } finally {
      setSaving(false);
    }
  };

  const addPair = async () => {
    if (!addQuote) return;
    setSaving(true);
    try {
      const res = await financeApi.fxRefresh([addQuote]);
      await qc.invalidateQueries({ queryKey: qk.fx });
      if (res.unsupported?.includes(addQuote)) {
        toast.error(`No live rate for ${base}/${addQuote} — add it manually via Override.`);
      } else {
        toast.success(`Now tracking ${base}/${addQuote}`);
      }
      setAddQuote(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add pair');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<FxRate>[] = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'base', header: 'Base Currency', render: (r) => <span className="nums font-medium">{r.base}</span> },
    { key: 'quote', header: 'Quote Currency', render: (r) => <span className="nums font-medium">{r.quote}</span> },
    { key: 'rate', header: 'Rate', align: 'right', render: (r) => <span className="nums">{r.rate.toFixed(4)}</span> },
    { key: 'source', header: 'Source', render: (r) => <StatusBadge status={r.source} dot={false} size="sm" tone={r.source === 'auto' ? 'info' : 'neutral'} /> },
    { key: 'actions', header: '', align: 'right', render: (r) => <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setOverride({ quote: r.quote, rate: String(r.rate) })}>Override</Button> },
  ];

  const addOptions = CURRENCIES.filter((c) => c !== base && !tracked.has(c));

  return (
    <div>
      <PageHeader
        title="FX Rates"
        description="Daily exchange rates against the presentation currency."
        actions={
          <>
            <Button variant="outline" icon={Plus} onClick={() => setAddQuote(addOptions[0] ?? null)} disabled={addOptions.length === 0}>Add Pair</Button>
            <Button icon={RefreshCcw} loading={refreshing} onClick={refresh}>Refresh from API</Button>
          </>
        }
      />

      <Card className="mb-4" padding="sm">
        <div className="flex items-center gap-3">
          <span className="text-sm text-content-muted">As of</span>
          <Input type="date" sizeVariant="sm" max={todayStr} value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
          <span className="text-2xs text-content-subtle">Base currency is your presentation currency ({base}). Rates show how many of the quote currency equal 1 {base}.</span>
        </div>
      </Card>

      <DataTable data={rates} columns={columns} rowKey={(r) => r.id} loading={isLoading} empty={<EmptyState icon={RefreshCcw} title="No FX pairs yet" description={`Click "Refresh from API" to pull live rates, or add a pair to track.`} />} />

      {/* Manual override */}
      <Modal open={!!override} onClose={() => setOverride(null)} title="Override exchange rate" size="sm">
        {override && (
          <div className="space-y-4">
            <FormField label="Pair">
              <div className="rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm nums">1 {base} = ? {override.quote}</div>
            </FormField>
            <FormField label="Rate">
              <Input type="number" step="0.0001" value={override.rate} onChange={(e) => setOverride({ ...override, rate: e.target.value })} placeholder="0.0000" autoFocus />
            </FormField>
            <p className="text-2xs text-content-subtle">Saved as a manual rate for {formatDate(date)}; it won't be overwritten by an API refresh.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOverride(null)}>Cancel</Button>
              <Button loading={saving} onClick={saveOverride}>Save rate</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add a new pair to track */}
      <Modal open={!!addQuote} onClose={() => setAddQuote(null)} title="Add currency pair" size="sm">
        {addQuote && (
          <div className="space-y-4">
            <FormField label="Quote currency">
              <Select value={addQuote} onChange={(e) => setAddQuote(e.target.value)} options={addOptions.map((c) => ({ value: c, label: `${base} / ${c}` }))} />
            </FormField>
            <p className="text-2xs text-content-subtle">We'll fetch the live rate for {base}/{addQuote} and start tracking it.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAddQuote(null)}>Cancel</Button>
              <Button loading={saving} onClick={addPair}>Add &amp; fetch</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
