import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Plus, FileSignature, LifeBuoy, ShieldCheck } from 'lucide-react';
import { PageHeader, useFormatMoney } from '@/shared';
import { Button, Card, CardTitle, Input, Select, Textarea, FormField, Toggle } from '@ds/primitives';
import { DataTable, StatusBadge, DateBadge, type Column } from '@ds/data-display';
import { EmptyState, Modal, toast } from '@ds/feedback';
import { formatDate, daysUntil } from '@/lib/format';
import { useMyContracts, useMyClient } from '../hooks';
import type { Contract } from '@/types';

/* ---- C2.8 Contracts ---- */
export function ClientContracts() {
  const money = useFormatMoney();
  const { data: contracts = [], isLoading } = useMyContracts();
  const columns: Column<Contract>[] = [
    { key: 'code', header: 'Code', render: (c) => <span className="nums font-medium text-brand-600">{c.code}</span> },
    { key: 'type', header: 'Type', render: (c) => <StatusBadge status={c.type} dot={false} size="sm" tone="neutral" /> },
    { key: 'start', header: 'Start', render: (c) => formatDate(c.startDate) },
    { key: 'end', header: 'End', render: (c) => <span className="flex items-center gap-2">{formatDate(c.endDate)}{c.status === 'Active' && daysUntil(c.endDate) <= 90 && <DateBadge date={c.endDate} />}</span> },
    { key: 'value', header: 'Value', align: 'right', render: (c) => <span className="nums">{money(c.value)}</span> },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: 'actions', header: '', align: 'right', render: () => <Button size="sm" variant="ghost" icon={Download} onClick={() => toast.success('Contract downloaded')}>Download</Button> },
  ];
  return (
    <div>
      <PageHeader title="Contracts" description="Your active and historical contracts." />
      <DataTable data={contracts} columns={columns} rowKey={(c) => c.id} loading={isLoading} empty={<EmptyState icon={FileSignature} title="No contracts" description="You have no contracts on file." />} />
    </div>
  );
}

/* ---- C2.9 Support / Tickets ---- */
interface Ticket { id: string; subject: string; category: string; priority: string; status: string; updated: string; }
const SEED_TICKETS: Ticket[] = [
  { id: 'TKT-001', subject: 'Question about invoice INV-0003', category: 'Billing', priority: 'Medium', status: 'Open', updated: '2026-06-05' },
  { id: 'TKT-002', subject: 'Request additional report', category: 'Feature Request', priority: 'Low', status: 'Resolved', updated: '2026-05-22' },
];

export function ClientSupport() {
  const [tickets, setTickets] = useState(SEED_TICKETS);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ subject: string; category: string; priority: string; description: string }>({ defaultValues: { category: 'Billing', priority: 'Medium' } });

  const columns: Column<Ticket>[] = [
    { key: 'id', header: 'Ticket #', render: (t) => <span className="nums font-medium text-brand-600">{t.id}</span> },
    { key: 'subject', header: 'Subject', render: (t) => <span className="font-medium text-content">{t.subject}</span> },
    { key: 'category', header: 'Category', render: (t) => <span className="text-content-muted">{t.category}</span> },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} size="sm" tone={t.priority === 'High' ? 'warning' : 'neutral'} /> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'updated', header: 'Last Update', render: (t) => formatDate(t.updated) },
  ];

  return (
    <div>
      <PageHeader title="Support" description="Submit a request or track your tickets." actions={<Button icon={Plus} onClick={() => setOpen(true)}>New Ticket</Button>} />
      <DataTable data={tickets} columns={columns} rowKey={(t) => t.id} empty={<EmptyState icon={LifeBuoy} title="No tickets" description="Submit a ticket and we'll get back to you." action={<Button icon={Plus} onClick={() => setOpen(true)}>New Ticket</Button>} />} />
      <Modal open={open} onClose={() => setOpen(false)} title="New Ticket" size="md"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit((v) => { setTickets((t) => [{ id: `TKT-${String(t.length + 1).padStart(3, '0')}`, subject: v.subject, category: v.category, priority: v.priority, status: 'Open', updated: new Date().toISOString().slice(0, 10) }, ...t]); toast.success('Ticket submitted'); reset(); setOpen(false); })}>Submit</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Subject" required className="sm:col-span-2"><Input {...register('subject')} /></FormField>
          <FormField label="Category"><Select options={['Billing', 'Service Issue', 'Feature Request', 'Other'].map((c) => ({ value: c, label: c }))} {...register('category')} /></FormField>
          <FormField label="Priority"><Select options={['Low', 'Medium', 'High'].map((p) => ({ value: p, label: p }))} {...register('priority')} /></FormField>
          <FormField label="Description" className="sm:col-span-2"><Textarea rows={3} {...register('description')} /></FormField>
        </div>
      </Modal>
    </div>
  );
}

/* ---- C2.10 My Profile ---- */
export function ClientProfile() {
  const { data: client } = useMyClient();
  const [twoFactor, setTwoFactor] = useState(false);
  return (
    <div>
      <PageHeader title="My Profile" description="Manage your contact information." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Account Details</CardTitle>
          <dl className="space-y-3 text-sm">
            {[['Client Code', client?.code], ['Client Name', client?.name], ['Tax ID', client?.taxId]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-content-muted">{k}</dt><dd className="font-medium text-content">{v || '—'}</dd></div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-content-subtle">To change these, please contact your service provider.</p>
        </Card>
        <Card>
          <CardTitle className="mb-4">Contact Information</CardTitle>
          <div className="space-y-4">
            <FormField label="Primary Contact"><Input defaultValue={client?.name} /></FormField>
            <FormField label="Email"><Input defaultValue={client?.email} /></FormField>
            <FormField label="Phone"><Input defaultValue={client?.phone} /></FormField>
            <FormField label="Billing Address"><Textarea rows={2} defaultValue={client?.billingAddress} /></FormField>
            <Button onClick={() => toast.success('Profile saved')}>Save</Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle className="mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Password & Security</CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="outline" onClick={() => toast.info('Change password (stub)')}>Change Password</Button>
            <label className="flex items-center gap-3 text-sm">
              <span className="font-medium text-content">Two-factor authentication</span>
              <Toggle checked={twoFactor} onChange={(v) => { setTwoFactor(v); toast.success(v ? '2FA enabled' : '2FA disabled'); }} />
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
