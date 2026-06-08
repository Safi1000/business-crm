import { useForm } from 'react-hook-form';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, FormField, Toggle } from '@ds/primitives';
import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import { useContractMutations } from '../hooks/useContracts';
import type { Contract } from '@/types';

export function ContractFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: clients } = useClients({ pageSize: 1000, status: 'Active' });
  const { create } = useContractMutations();
  const [autoInvoice, setAutoInvoice] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ clientId: string; type: Contract['type']; startDate: string; endDate: string; value: number }>({
    defaultValues: { type: 'Service Agreement', startDate: new Date().toISOString().slice(0, 10) },
  });

  return (
    <Modal open={open} onClose={onClose} title="Create Contract" size="md"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={create.isPending} onClick={handleSubmit(async (v) => { await create.mutateAsync({ ...v, value: Number(v.value), autoInvoice, currency: 'PKR' }); toast.success('Contract created'); reset(); setAutoInvoice(false); onClose(); })}>Create Contract</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Client" required className="sm:col-span-2"><Select placeholder="Select client…" options={(clients?.rows ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))} {...register('clientId')} /></FormField>
        <FormField label="Type"><Select options={['Service Agreement', 'Retainer', 'Project'].map((t) => ({ value: t, label: t }))} {...register('type')} /></FormField>
        <FormField label="Value"><Input type="number" {...register('value')} /></FormField>
        <FormField label="Start Date"><Input type="date" {...register('startDate')} /></FormField>
        <FormField label="End Date"><Input type="date" {...register('endDate')} /></FormField>
        <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 sm:col-span-2">
          <div><p className="text-sm font-medium text-content">Auto-invoice</p><p className="text-xs text-content-muted">Generate monthly invoices automatically for retainers.</p></div>
          <Toggle checked={autoInvoice} onChange={setAutoInvoice} />
        </div>
      </div>
    </Modal>
  );
}
