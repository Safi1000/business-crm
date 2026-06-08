import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, FileText, Download, Wallet, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { PageHeader, KpiStrip, useFormatMoney } from '@/shared';
import { Button, Card, CardTitle, Input, Select, Textarea, FormField, Toggle } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, type Column } from '@ds/data-display';
import { EmptyState, Modal, toast } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { useMe } from '../hooks';

/* ---- E2.7 Timesheets ---- */
const PROJECTS = ['Website Revamp', 'ERP Rollout', 'Internal'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function EmployeeTimesheets() {
  const [grid, setGrid] = useState<number[][]>(PROJECTS.map(() => DAYS.map(() => 0)));
  const rowTotal = (r: number[]) => r.reduce((s, v) => s + (v || 0), 0);
  const colTotal = (c: number) => grid.reduce((s, r) => s + (r[c] || 0), 0);
  const grand = grid.reduce((s, r) => s + rowTotal(r), 0);

  return (
    <div>
      <PageHeader title="Timesheets" description="Log hours and submit your week for approval." actions={<><Button variant="outline" onClick={() => toast.success('Draft saved')}>Save Draft</Button><Button onClick={() => toast.success('Week submitted for approval')}>Submit Week</Button></>} />
      <Card padding="none">
        <div className="flex items-center justify-between border-b border-line p-4"><CardTitle>Week of 2–8 Jun 2026</CardTitle><StatusBadge status="Draft" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line bg-surface-sunken/60 text-left text-2xs uppercase tracking-wide text-content-subtle"><th className="px-4 py-2.5">Project</th>{DAYS.map((d) => <th key={d} className="px-2 py-2.5 text-center">{d}</th>)}<th className="px-4 py-2.5 text-right">Total</th></tr></thead>
            <tbody>
              {PROJECTS.map((p, ri) => (
                <tr key={p} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 font-medium text-content">{p}</td>
                  {DAYS.map((_, ci) => (
                    <td key={ci} className="px-1 py-2">
                      <Input sizeVariant="sm" type="number" className="w-14 text-center" value={grid[ri]![ci]!} onChange={(e) => setGrid((g) => g.map((row, i) => (i === ri ? row.map((v, j) => (j === ci ? Number(e.target.value) : v)) : row)))} />
                    </td>
                  ))}
                  <td className="nums px-4 py-2 text-right font-semibold">{rowTotal(grid[ri]!)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-surface-sunken/40 font-semibold"><td className="px-4 py-2.5">Total</td>{DAYS.map((_, ci) => <td key={ci} className="nums px-2 py-2.5 text-center">{colTotal(ci)}</td>)}<td className="nums px-4 py-2.5 text-right text-brand-600">{grand}h</td></tr></tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---- E2.8 My Expenses ---- */
interface Reimb { id: string; date: string; category: string; description: string; amount: number; status: string; }
const SEED: Reimb[] = [
  { id: 'R1', date: '2026-06-02', category: 'Travel', description: 'Client visit — fuel', amount: 4500, status: 'Pending' },
  { id: 'R2', date: '2026-05-20', category: 'Software', description: 'Design tool license', amount: 12000, status: 'Reimbursed' },
];

export function EmployeeExpenses() {
  const money = useFormatMoney();
  const [rows, setRows] = useState(SEED);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ date: string; category: string; description: string; amount: number }>({ defaultValues: { category: 'Travel', date: new Date().toISOString().slice(0, 10) } });

  const columns: Column<Reimb>[] = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'category', header: 'Category', render: (r) => r.category },
    { key: 'description', header: 'Description', render: (r) => r.description },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="nums font-medium">{money(r.amount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', align: 'right', render: (r) => (r.status === 'Pending' ? <Button size="sm" variant="ghost" onClick={() => toast.info('Withdrawn')}>Cancel</Button> : null) },
  ];

  return (
    <div>
      <PageHeader title="My Expenses" description="Submit work expenses for reimbursement." actions={<Button icon={Plus} onClick={() => setOpen(true)}>Submit Expense</Button>} />
      <KpiStrip cols={3}>
        <KPICard label="Pending Reimbursement" value={rows.filter((r) => r.status === 'Pending').reduce((s, r) => s + r.amount, 0)} format={(n) => money(n)} icon={Clock} tone="warning" />
        <KPICard label="YTD Claimed" value={rows.reduce((s, r) => s + r.amount, 0)} format={(n) => money(n)} icon={Wallet} tone="brand" />
        <KPICard label="YTD Paid" value={rows.filter((r) => r.status === 'Reimbursed').reduce((s, r) => s + r.amount, 0)} format={(n) => money(n)} icon={CheckCircle2} tone="success" />
      </KpiStrip>
      <DataTable data={rows} columns={columns} rowKey={(r) => r.id} empty={<EmptyState icon={Wallet} title="No expenses" description="Submit a work expense to get reimbursed." />} />
      <Modal open={open} onClose={() => setOpen(false)} title="Submit Expense" size="md"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit((v) => { setRows((r) => [{ id: `R${r.length + 1}`, ...v, amount: Number(v.amount), status: 'Pending' }, ...r]); toast.success('Expense submitted for approval'); reset(); setOpen(false); })}>Submit</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date"><Input type="date" {...register('date')} /></FormField>
          <FormField label="Category"><Select options={['Travel', 'Software', 'Meals', 'Equipment', 'Other'].map((c) => ({ value: c, label: c }))} {...register('category')} /></FormField>
          <FormField label="Amount" required><Input type="number" {...register('amount')} /></FormField>
          <FormField label="Description" className="sm:col-span-2"><Textarea rows={2} {...register('description')} /></FormField>
          <p className="text-xs text-content-subtle sm:col-span-2">Receipt upload required on the full form.</p>
        </div>
      </Modal>
    </div>
  );
}

/* ---- E2.9 Documents (read-only) ---- */
const FILES = ['HR Policy 2026.pdf', 'Holiday List 2026.pdf', 'Employee Handbook.pdf', 'Code of Conduct.pdf', 'Health Insurance.pdf'];
export function EmployeeDocuments() {
  return (
    <div>
      <PageHeader title="Documents" description="Company documents shared with employees." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FILES.map((f) => (
          <Card key={f} className="flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-sunken text-content-muted"><FileText size={20} /></span><span className="text-sm font-medium text-content">{f}</span></div>
            <Button size="sm" variant="ghost" icon={Download} aria-label="Download" onClick={() => toast.success('Downloaded')} />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---- E2.10 My Profile ---- */
export function EmployeeProfile() {
  const { data: me } = useMe();
  const money = useFormatMoney();
  const [twoFactor, setTwoFactor] = useState(false);
  return (
    <div>
      <PageHeader title="My Profile" description="View your details and update contact info." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Employment Info</CardTitle>
          <dl className="space-y-3 text-sm">
            {[['Employee ID', me?.code], ['Name', me?.name], ['Department', me?.department], ['Branch', me?.branch], ['Manager', me?.reportingTo ?? '—'], ['Join Date', me ? formatDate(me.joinDate) : '—'], ['Base Salary', me ? money(me.baseSalary) : '—']].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-content-muted">{k}</dt><dd className="font-medium text-content">{v || '—'}</dd></div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-content-subtle">To change these, please contact HR.</p>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">Contact Information</CardTitle>
            <div className="space-y-4">
              <FormField label="Phone"><Input defaultValue={me?.phone} /></FormField>
              <FormField label="Address"><Textarea rows={2} defaultValue={me?.address} /></FormField>
              <Button onClick={() => toast.success('Contact info saved')}>Save</Button>
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-4">Bank Info</CardTitle>
            <div className="space-y-4">
              <FormField label="Bank Name"><Input defaultValue={me?.bankName} /></FormField>
              <FormField label="IBAN" hint="Changes take effect next payroll."><Input defaultValue={me?.iban} /></FormField>
              <Button variant="outline" onClick={() => toast.info('Bank update sent to HR for confirmation')}>Update Bank Info</Button>
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Password & Security</CardTitle>
            <div className="space-y-4">
              <Button variant="outline" onClick={() => toast.info('Change password (stub)')}>Change Password</Button>
              <label className="flex items-center justify-between text-sm">
                <span className="font-medium text-content">Two-factor authentication</span>
                <Toggle checked={twoFactor} onChange={(v) => { setTwoFactor(v); toast.success(v ? '2FA enabled' : '2FA disabled'); }} />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
