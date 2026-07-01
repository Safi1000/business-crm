import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, FormField } from '@ds/primitives';
import { clientsApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import { labelText, strictOptionalText, numberField, dateField } from '@/lib/validation';
import { useProjectMutations } from '../hooks';
import type { Project } from '@/types';

const schema = z.object({
  name: labelText('Project name'),
  clientId: z.string().optional(),
  managerName: strictOptionalText,
  billingModel: z.enum(['Fixed', 'T&M', 'Retainer']),
  status: z.enum(['Lead', 'Active', 'On Hold', 'Completed']),
  budget: numberField({ min: 0, label: 'Budget' }).optional(),
  startDate: dateField(false, 'Start date'),
  endDate: dateField(false, 'End date'),
});
type FormValues = z.infer<typeof schema>;

export function CreateProjectModal({ open, onClose, project }: { open: boolean; onClose: () => void; project?: Project }) {
  // Client list comes from the shared data layer (panels never import each other).
  const { data: clients } = useQuery({ queryKey: qk.clients({ pageSize: 1000, status: 'Active' }), queryFn: () => clientsApi.list({ pageSize: 1000, status: 'Active' }) });
  const { create, update } = useProjectMutations();
  const editing = !!project;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { billingModel: 'Fixed', status: 'Lead', startDate: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (project) reset({
      name: project.name, clientId: project.clientId, managerName: project.managerName,
      billingModel: project.billingModel, status: project.status, budget: project.budget ?? 0,
      startDate: project.startDate, endDate: project.endDate,
    });
  }, [project, reset]);

  const onInvalid = () => toast.error('Please fix the highlighted fields before saving.');
  const onSubmit = handleSubmit(async (v) => {
    const data = { ...v, budget: v.budget ? Number(v.budget) : null, currency: 'PKR' as const };
    try {
      if (editing) { await update.mutateAsync({ id: project!.id, data }); toast.success('Project updated'); }
      else { await create.mutateAsync(data); toast.success('Project created'); reset(); }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save project. Try again.');
    }
  }, onInvalid);

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Project' : 'Create Project'} size="md"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={create.isPending || update.isPending} onClick={onSubmit}>{editing ? 'Save Changes' : 'Create Project'}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Project Name" required error={errors.name?.message} className="sm:col-span-2"><Input placeholder="Website Revamp" invalid={!!errors.name} {...register('name')} /></FormField>
        <FormField label="Client"><Select placeholder="Select client…" options={(clients?.rows ?? []).map((c) => ({ value: c.id, label: c.name }))} {...register('clientId')} /></FormField>
        <FormField label="Manager"><Input placeholder="Manager name" {...register('managerName')} /></FormField>
        <FormField label="Billing Model"><Select options={['Fixed', 'T&M', 'Retainer'].map((b) => ({ value: b, label: b }))} {...register('billingModel')} /></FormField>
        <FormField label="Status"><Select options={['Lead', 'Active', 'On Hold', 'Completed'].map((s) => ({ value: s, label: s }))} {...register('status')} /></FormField>
        <FormField label="Budget"><Input type="number" placeholder="0" {...register('budget')} /></FormField>
        <FormField label="Start Date"><Input type="date" {...register('startDate')} /></FormField>
        <FormField label="End Date" className="sm:col-span-2"><Input type="date" {...register('endDate')} /></FormField>
      </div>
    </Modal>
  );
}
