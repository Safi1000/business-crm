import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, FilterBar } from '@/shared';
import { Button, Input, Select, FormField, Checkbox } from '@ds/primitives';
import { DataTable, StatusBadge, Avatar, type Column } from '@ds/data-display';
import { EmptyState, Modal, ConfirmDialog, toast } from '@ds/feedback';
import { useUrlFilters } from '@/lib/useUrlFilters';
import { useAuthStore } from '@/app/stores/auth';
import { useUsers, useUserMutations } from '../hooks';
import type { AppUser } from '@/types';

const FEATURES = ['Clients', 'Contracts', 'Invoices', 'Projects', 'Tasks', 'Workforce', 'Payroll', 'Attendance', 'Finance', 'Expenses', 'Reports', 'Compliance', 'Admin'];
const ROLES = ['Super Admin', 'Manager', 'Finance', 'HR', 'Ops'];

function UserFormModal({ open, onClose, user }: { open: boolean; onClose: () => void; user?: AppUser }) {
  const { create, update } = useUserMutations();
  const [perms, setPerms] = useState<string[]>(user?.permissions ?? []);
  const { register, handleSubmit, reset } = useForm<{ name: string; email: string; title: string; role: AppUser['role'] }>({
    defaultValues: user ?? { role: 'Ops' },
  });

  const toggle = (f: string) => setPerms((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  return (
    <Modal open={open} onClose={onClose} title={user ? 'Edit User' : 'Create User'} size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={create.isPending || update.isPending} onClick={handleSubmit(async (v) => { const data = { ...v, permissions: v.role === 'Super Admin' ? [] : perms }; if (user) { await update.mutateAsync({ id: user.id, data }); toast.success('User updated'); } else { await create.mutateAsync(data); toast.success('User created'); } reset(); onClose(); })}>Save</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" required><Input {...register('name')} /></FormField>
        <FormField label="Email" required><Input type="email" {...register('email')} /></FormField>
        <FormField label="Title"><Input placeholder="Finance Manager" {...register('title')} /></FormField>
        <FormField label="Role"><Select options={ROLES.map((r) => ({ value: r, label: r }))} {...register('role')} /></FormField>
      </div>
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-content">Permissions</p>
        <p className="mb-3 text-xs text-content-muted">Super Admins have implicit access to everything. Otherwise select feature access below.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <label key={f} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface-sunken">
              <Checkbox checked={perms.includes(f)} onChange={() => toggle(f)} /> {f}
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function UsersPage() {
  const { values, set } = useUrlFilters({ search: '' });
  const { data: users = [], isLoading } = useUsers(values.search ?? '');
  const { remove } = useUserMutations();
  // Only the Super Super Admin may remove a Super Admin; peers can't delete each other.
  const isSSA = useAuthStore((s) => s.user?.role === 'Super Super Admin');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | undefined>();
  const [confirmDel, setConfirmDel] = useState<AppUser | null>(null);

  const columns: Column<AppUser>[] = [
    { key: 'name', header: 'Name', render: (u) => <div className="flex items-center gap-2.5"><Avatar name={u.name} size="sm" /><span className="font-semibold text-content">{u.name}</span></div> },
    { key: 'email', header: 'Email', render: (u) => <span className="text-content-muted">{u.email}</span> },
    { key: 'title', header: 'Title', render: (u) => u.title },
    { key: 'role', header: 'Role', render: (u) => <StatusBadge status={u.role} dot={false} size="sm" tone={u.role === 'Super Admin' ? 'brand' : 'neutral'} /> },
    { key: 'perms', header: 'Permissions', render: (u) => <span className="text-content-muted">{u.permissions.length === 0 ? 'All (implicit)' : `${u.permissions.length} features`}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} aria-label="Edit" onClick={() => { setEditing(u); setModalOpen(true); }} />
          <Button size="sm" variant="ghost" icon={Trash2} aria-label="Delete" onClick={() => setConfirmDel(u)} disabled={u.role === 'Super Admin' && !isSSA} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users & Permissions" description="Manage who can log in and what they can access." actions={<Button icon={Plus} onClick={() => { setEditing(undefined); setModalOpen(true); }}>Create User</Button>} />
      <FilterBar search={values.search} onSearchChange={(v) => set({ search: v })} searchPlaceholder="Search by name, email, title…" />
      <DataTable data={users} columns={columns} rowKey={(u) => u.id} loading={isLoading} empty={<EmptyState icon={ShieldCheck} title="No users" description="Create your first user." action={<Button icon={Plus} onClick={() => setModalOpen(true)}>Create User</Button>} />} />
      <UserFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined); }} user={editing} />
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete this user?" message={`${confirmDel?.name} will be deactivated.`} confirmLabel="Delete" onConfirm={async () => { if (confirmDel) { await remove.mutateAsync(confirmDel.id); toast.success('User deactivated'); } }} />
    </div>
  );
}
