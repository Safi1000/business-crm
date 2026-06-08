import { useForm } from 'react-hook-form';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, Textarea, FormField } from '@ds/primitives';
import { useProjectsList, useTaskMutations } from '../hooks';
import type { Task, TaskPriority, TaskStatus } from '@/types';

export function CreateTaskModal({ open, onClose, defaultDue }: { open: boolean; onClose: () => void; defaultDue?: string }) {
  const { data: projects } = useProjectsList();
  const { create } = useTaskMutations();
  const { register, handleSubmit, reset } = useForm<{ title: string; projectId: string; priority: TaskPriority; status: TaskStatus; dueDate: string; description: string }>({
    defaultValues: { priority: 'Medium', status: 'To Do', dueDate: defaultDue ?? '' },
  });

  return (
    <Modal open={open} onClose={onClose} title="Create Task" size="md"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={create.isPending} onClick={handleSubmit(async (v) => {
        const project = projects?.rows.find((p) => p.id === v.projectId);
        await create.mutateAsync({ ...v, projectName: project?.name ?? null, projectId: v.projectId || null, dueDate: v.dueDate || null } as Partial<Task>);
        toast.success('Task created'); reset(); onClose();
      })}>Create Task</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" required className="sm:col-span-2"><Input placeholder="What needs doing?" {...register('title')} /></FormField>
        <FormField label="Project"><Select placeholder="Standalone" options={[{ value: '', label: 'Standalone' }, ...(projects?.rows ?? []).map((p) => ({ value: p.id, label: p.name }))]} {...register('projectId')} /></FormField>
        <FormField label="Priority"><Select options={['Low', 'Medium', 'High', 'Urgent'].map((p) => ({ value: p, label: p }))} {...register('priority')} /></FormField>
        <FormField label="Status"><Select options={['Backlog', 'To Do', 'In Progress', 'Review', 'Done'].map((s) => ({ value: s, label: s }))} {...register('status')} /></FormField>
        <FormField label="Due Date"><Input type="date" {...register('dueDate')} /></FormField>
        <FormField label="Description" className="sm:col-span-2"><Textarea rows={2} {...register('description')} /></FormField>
      </div>
    </Modal>
  );
}
