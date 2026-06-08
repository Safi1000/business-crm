import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plane, Stethoscope, Coffee, Clock, Plus } from 'lucide-react';
import { PageHeader, KpiStrip } from '@/shared';
import { Button, Select, Input, Textarea, FormField } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, type Column } from '@ds/data-display';
import { EmptyState, Modal, toast } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { useMyLeaves } from '../hooks';
import type { Leave } from '@/types';

export function EmployeeLeaves() {
  const { data: leaves = [], isLoading } = useMyLeaves();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ type: string; from: string; to: string; reason: string }>({ defaultValues: { type: 'Annual' } });

  const columns: Column<Leave>[] = [
    { key: 'applied', header: 'Applied On', render: (l) => formatDate(l.appliedOn) },
    { key: 'type', header: 'Type', render: (l) => <StatusBadge status={l.type} dot={false} size="sm" tone="neutral" /> },
    { key: 'from', header: 'From', render: (l) => formatDate(l.from) },
    { key: 'to', header: 'To', render: (l) => formatDate(l.to) },
    { key: 'days', header: 'Days', align: 'center', render: (l) => <span className="nums">{l.days}</span> },
    { key: 'reason', header: 'Reason', render: (l) => <span className="text-content-muted">{l.reason}</span> },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'actions', header: '', align: 'right', render: (l) => (l.status === 'Pending' ? <Button size="sm" variant="ghost" onClick={() => toast.info('Leave withdrawn')}>Cancel</Button> : null) },
  ];

  return (
    <div>
      <PageHeader title="Leaves" description="Apply for leave and track your balance." actions={<Button icon={Plus} onClick={() => setOpen(true)}>Apply for Leave</Button>} />
      <KpiStrip cols={4}>
        <KPICard label="Annual Remaining" value={14} format={(n) => `${Math.round(n)} days`} icon={Plane} tone="success" />
        <KPICard label="Sick Remaining" value={8} format={(n) => `${Math.round(n)} days`} icon={Stethoscope} tone="info" />
        <KPICard label="Casual Remaining" value={5} format={(n) => `${Math.round(n)} days`} icon={Coffee} tone="brand" />
        <KPICard label="Pending Requests" value={leaves.filter((l) => l.status === 'Pending').length} format={(n) => String(Math.round(n))} icon={Clock} tone="warning" />
      </KpiStrip>

      <DataTable data={leaves} columns={columns} rowKey={(l) => l.id} loading={isLoading} empty={<EmptyState icon={Plane} title="No leave history" description="Apply for leave to get started." action={<Button icon={Plus} onClick={() => setOpen(true)}>Apply for Leave</Button>} />} />

      <Modal open={open} onClose={() => setOpen(false)} title="Apply for Leave" size="md"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit(() => { toast.success('Leave request submitted to your manager'); reset(); setOpen(false); })}>Submit</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Leave Type" className="sm:col-span-2"><Select options={['Annual', 'Sick', 'Casual', 'Unpaid'].map((t) => ({ value: t, label: t }))} {...register('type')} /></FormField>
          <FormField label="From"><Input type="date" {...register('from')} /></FormField>
          <FormField label="To"><Input type="date" {...register('to')} /></FormField>
          <FormField label="Reason" className="sm:col-span-2"><Textarea rows={2} {...register('reason')} /></FormField>
        </div>
        <p className="mt-3 text-xs text-content-subtle">Approver: Reporting Manager. Working days are auto-calculated on submission.</p>
      </Modal>
    </div>
  );
}
