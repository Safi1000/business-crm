import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, Textarea, FormField } from '@ds/primitives';
import { labelText, freeText, dateField } from '@/lib/validation';
import { useProjectsList, useTaskMutations } from '../hooks';
import type { Task } from '@/types';

const schema = z.object({
  title: labelText('Task name'),
  projectId: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['Backlog', 'To Do', 'In Progress', 'Review', 'Done']),
  dueDate: dateField(false, 'Due date'),
  description: freeText,
});
type FormValues = z.infer<typeof schema>;

export function CreateTaskModal({
  open,
  onClose,
  defaultDue,
  defaultProjectId,
  lockProject,
}: {
  open: boolean;
  onClose: () => void;
  defaultDue?: string;
  /** Pre-select (and optionally lock) the project — used when creating from a project. */
  defaultProjectId?: string;
  lockProject?: boolean;
}) {
  const { data: projects } = useProjectsList();
  const { create } = useTaskMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { priority: 'Medium', status: 'To Do', dueDate: defaultDue ?? '', projectId: defaultProjectId ?? '', title: '', description: '' },
  });

  // Re-seed defaults whenever the modal (re)opens or the source project changes.
  useEffect(() => {
    if (open) reset({ priority: 'Medium', status: 'To Do', dueDate: defaultDue ?? '', projectId: defaultProjectId ?? '', title: '', description: '' });
  }, [open, defaultDue, defaultProjectId, reset]);

  const onInvalid = () => toast.error('Please fix the highlighted fields before saving.');
  const onSubmit = handleSubmit(async (v) => {
    const project = projects?.rows.find((p) => p.id === v.projectId);
    try {
      await create.mutateAsync({
        ...v,
        projectName: project?.name ?? null,
        projectId: v.projectId || null,
        dueDate: v.dueDate || null,
      } as Partial<Task>);
      toast.success('Task created');
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create task. Try again.');
    }
  }, onInvalid);

  return (
    <Modal open={open} onClose={onClose} title="Create Task" size="md"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={create.isPending} onClick={onSubmit}>Create Task</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" required error={errors.title?.message} className="sm:col-span-2">
          <Input placeholder="What needs doing?" invalid={!!errors.title} {...register('title')} />
        </FormField>
        <FormField label="Project">
          <Select
            placeholder="Standalone"
            disabled={lockProject}
            options={[{ value: '', label: 'Standalone' }, ...(projects?.rows ?? []).map((p) => ({ value: p.id, label: p.name }))]}
            {...register('projectId')}
          />
        </FormField>
        <FormField label="Priority"><Select options={['Low', 'Medium', 'High', 'Urgent'].map((p) => ({ value: p, label: p }))} {...register('priority')} /></FormField>
        <FormField label="Status"><Select options={['Backlog', 'To Do', 'In Progress', 'Review', 'Done'].map((s) => ({ value: s, label: s }))} {...register('status')} /></FormField>
        <FormField label="Due Date" error={errors.dueDate?.message}><Input type="date" {...register('dueDate')} /></FormField>
        <FormField label="Description" error={errors.description?.message} className="sm:col-span-2"><Textarea rows={2} {...register('description')} /></FormField>
      </div>
    </Modal>
  );
}
