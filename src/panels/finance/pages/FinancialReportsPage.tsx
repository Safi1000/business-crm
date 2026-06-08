import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader, useFormatMoney } from '@/shared';
import { Button, Tabs, Card, CardTitle, Select, type TabItem } from '@ds/primitives';
import { toast } from '@ds/feedback';
import { cn } from '@/lib/cn';
import { useCashflow } from '../hooks';

interface PLRow {
  label: string;
  value: number;
  /** total/subtotal styling */
  bold?: boolean;
  indent?: boolean;
}

export function FinancialReportsPage() {
  const money = useFormatMoney();
  const [tab, setTab] = useState('pl');
  const { data: cashflow = [] } = useCashflow();

  const pl = useMemo<PLRow[]>(() => {
    const revenue = cashflow.reduce((s, m) => s + m.revenue, 0);
    const payroll = cashflow.reduce((s, m) => s + m.payroll, 0);
    const expenses = cashflow.reduce((s, m) => s + m.expenses, 0);
    const cos = Math.round(revenue * 0.35);
    const grossProfit = revenue - cos;
    const opProfit = grossProfit - payroll - expenses;
    const otherIncome = Math.round(revenue * 0.02);
    const ebt = opProfit + otherIncome;
    const taxes = Math.round(Math.max(ebt, 0) * 0.29);
    const net = ebt - taxes;
    return [
      { label: 'Revenue', value: revenue, bold: true },
      { label: 'Cost of Services', value: -cos, indent: true },
      { label: 'Gross Profit', value: grossProfit, bold: true },
      { label: 'Operating Expenses', value: -expenses, indent: true },
      { label: 'Payroll', value: -payroll, indent: true },
      { label: 'Operating Profit', value: opProfit, bold: true },
      { label: 'Other Income', value: otherIncome, indent: true },
      { label: 'Earnings Before Tax', value: ebt, bold: true },
      { label: 'Taxes', value: -taxes, indent: true },
      { label: 'Net Profit', value: net, bold: true },
    ];
  }, [cashflow]);

  const tabs: TabItem[] = [
    { value: 'pl', label: 'Profit & Loss' },
    { value: 'statements', label: 'Client Statements' },
    { value: 'coa', label: 'Chart of Accounts' },
    { value: 'partnership', label: 'Partnership Report' },
  ];

  const coa = [
    { group: 'Assets', items: ['Cash & Bank', 'Accounts Receivable', 'Fixed Assets'] },
    { group: 'Liabilities', items: ['Accounts Payable', 'Tax Payable', 'Loans'] },
    { group: 'Equity', items: ["Partner's Capital", 'Retained Earnings'] },
    { group: 'Revenue', items: ['Service Revenue', 'Other Income'] },
    { group: 'Expenses', items: ['Salaries', 'Rent', 'Utilities', 'Marketing'] },
  ];

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        description="P&L, client statements, chart of accounts and partnership distribution."
        actions={<Button icon={Download} onClick={() => toast.success('Report PDF generated')}>Export PDF</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs items={tabs} value={tab} onChange={setTab} />
        {tab === 'pl' && (
          <div className="flex gap-2">
            <Select sizeVariant="sm" className="w-32" options={[{ value: '2026-06', label: 'Jun 2026' }, { value: '2026-05', label: 'May 2026' }]} />
            <Select sizeVariant="sm" className="w-32" options={[{ value: '', label: 'All Branches' }]} />
          </div>
        )}
      </div>

      {tab === 'pl' && (
        <Card padding="none">
          <table className="w-full text-sm">
            <tbody>
              {pl.map((r, i) => (
                <tr key={i} className={cn('border-b border-line last:border-0', r.bold && 'bg-surface-sunken/40')}>
                  <td className={cn('px-5 py-3', r.indent && 'pl-10 text-content-muted', r.bold && 'font-semibold text-content')}>{r.label}</td>
                  <td className={cn('nums px-5 py-3 text-right', r.bold ? 'font-bold' : 'text-content-muted', r.value < 0 && !r.bold && 'text-danger')}>
                    {r.value < 0 ? `(${money(Math.abs(r.value))})` : money(r.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-3 text-xs text-content-subtle">Click any line to drill into source transactions.</p>
        </Card>
      )}

      {tab === 'statements' && (
        <Card><CardTitle className="mb-4">Per-Client Profitability</CardTitle><p className="text-sm text-content-muted">Total Invoiced, Payroll Expense, Other Expenses and Total Income per client. Select a client to view the full statement.</p></Card>
      )}

      {tab === 'coa' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coa.map((g) => (
            <Card key={g.group}>
              <CardTitle className="mb-3">{g.group}</CardTitle>
              <ul className="space-y-2 text-sm">
                {g.items.map((it) => (
                  <li key={it} className="flex items-center justify-between text-content-muted">
                    <span>{it}</span>
                    <span className="nums text-2xs text-content-subtle">{1000 + g.items.indexOf(it)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {tab === 'partnership' && (
        <Card>
          <CardTitle className="mb-4">Profit Distribution by Partner</CardTitle>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line text-left text-2xs uppercase tracking-wide text-content-subtle"><th className="py-2">Partner</th><th className="py-2 text-right">Share</th><th className="py-2 text-right">Distribution</th></tr></thead>
            <tbody>
              {[['Faisal Malik', 50], ['Sara Khan', 30], ['Bilal Iqbal', 20]].map(([name, share]) => (
                <tr key={name as string} className="border-b border-line last:border-0">
                  <td className="py-3 font-medium">{name}</td>
                  <td className="nums py-3 text-right">{share}%</td>
                  <td className="nums py-3 text-right font-semibold">{money(Math.round((pl[pl.length - 1]!.value * (share as number)) / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
