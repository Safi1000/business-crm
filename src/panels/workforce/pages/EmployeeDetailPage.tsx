import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, UserX, MoreHorizontal, Mail, Phone, Building2, Calendar, Wallet, CreditCard, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { useFormatMoney, InvitePortalButton } from '@/shared';
import { Button, Card, CardHeader, CardTitle, Tabs, type TabItem } from '@ds/primitives';
import { StatusBadge, Avatar } from '@ds/data-display';
import { ErrorState, EmptyState, Skeleton, toast } from '@ds/feedback';
import { DropdownMenu } from '@ds/overlays';
import { formatDate } from '@/lib/format';
import { useEmployee, useEmployeeMutations, useEmployeeDocuments, useEmployeeDocMutations } from '../hooks';
import { EmployeeFormModal } from '../modals/EmployeeFormModal';
import { routes } from '@/config/routes';
import type { Employee } from '@/types';

function Field({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-content-subtle" />
      <div>
        <p className="text-2xs uppercase tracking-wide text-content-subtle">{label}</p>
        <p className="text-sm text-content">{value || '—'}</p>
      </div>
    </div>
  );
}

export function EmployeeDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const money = useFormatMoney();
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const { data: e, isLoading, isError, refetch } = useEmployee(id);
  const { update } = useEmployeeMutations();

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (isError || !e) return <ErrorState onRetry={() => refetch()} />;

  const isInactive = e.status === 'Inactive';
  const toggleStatus = async () => {
    const status = isInactive ? 'Active' : 'Inactive';
    try {
      await update.mutateAsync({ id: e.id, data: { status } });
      toast.success(isInactive ? 'Employee marked active' : 'Employee marked inactive');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update status. Try again.');
    }
  };

  const tabs: TabItem[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'leaves', label: 'Leaves & Advances' },
    { value: 'documents', label: 'Documents' },
    { value: 'tasks', label: 'Tasks' },
  ];

  return (
    <div>
      <button onClick={() => navigate(routes.employees)} className="mb-3 flex items-center gap-1.5 text-sm text-content-muted hover:text-content">
        <ArrowLeft size={16} /> Back to Employees
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={e.name} size="xl" />
          <div>
            <h1 className="font-display text-2xl font-bold text-content">{e.name}</h1>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-content-muted">
              <span className="nums">{e.code}</span> · {e.department} · {e.branch}
              <StatusBadge status={e.status} />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InvitePortalButton kind="employee" recordId={e.id} defaultEmail={e.email} />
          <Button variant="outline" icon={Pencil} onClick={() => setEditOpen(true)}>Edit</Button>
          <Button variant="outline" icon={UserX} loading={update.isPending} onClick={toggleStatus}>{isInactive ? 'Mark Active' : 'Mark Inactive'}</Button>
          <DropdownMenu trigger={<Button variant="outline" icon={MoreHorizontal} aria-label="More" />} items={[{ label: 'View Payslip', onClick: () => navigate(routes.payroll) }, { label: 'Export Profile' }]} />
        </div>
      </div>

      <Tabs items={tabs} value={tab} onChange={setTab} className="mb-6" />

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Profile & Employment</CardTitle></CardHeader>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field icon={Mail} label="Email" value={e.email} />
              <Field icon={Phone} label="Phone" value={e.phone} />
              <Field icon={Building2} label="Department" value={e.department} />
              <Field icon={Building2} label="Branch" value={e.branch} />
              <Field icon={Calendar} label="Join Date" value={formatDate(e.joinDate)} />
              <Field icon={FileText} label="Type" value={e.type} />
              <Field icon={FileText} label="CNIC" value={e.cnic} />
              <Field icon={FileText} label="EOBI No." value={e.eobiNo} />
            </div>
          </Card>
          <Card>
            <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
            <dl className="space-y-4">
              {[
                ['Base Salary', money(e.baseSalary)],
                ['Per-day', money(Math.round(e.baseSalary / 26))],
                ['Bank', e.bankName ?? '—'],
                ['IBAN', e.iban ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3"><dt className="text-sm text-content-muted">{k}</dt><dd className="nums truncate text-sm font-semibold text-content">{v}</dd></div>
              ))}
            </dl>
          </Card>
        </div>
      )}

      {tab === 'attendance' && <EmptyState icon={Calendar} title="Attendance calendar" description="Monthly attendance view for this employee (P0 manual mode aggregates here)." />}
      {tab === 'payroll' && <EmptyState icon={Wallet} title="Payslips" description="Past payslips and the current month draft." action={<Button size="sm" variant="outline" onClick={() => navigate(routes.payroll)}>Go to Payroll</Button>} />}
      {tab === 'leaves' && <EmptyState icon={CreditCard} title="Leaves & advances" description="Leave balance, applied leaves and advances." action={<Button size="sm" variant="outline" onClick={() => navigate(routes.leaves)}>Go to Leaves</Button>} />}
      {tab === 'documents' && <EmployeeDocuments employee={e} />}
      {tab === 'tasks' && <EmptyState icon={FileText} title="Assigned tasks" description="Tasks assigned to this employee." action={<Button size="sm" variant="outline" onClick={() => navigate(routes.tasks)}>Go to Tasks</Button>} />}

      <EmployeeFormModal open={editOpen} onClose={() => setEditOpen(false)} employee={e} />
    </div>
  );
}

/** BUG-10: itemized required-vs-uploaded documents with per-item upload. */
function EmployeeDocuments({ employee }: { employee: Employee }) {
  const { data, isLoading, isError, refetch } = useEmployeeDocuments(employee.id);
  const { upload } = useEmployeeDocMutations(employee.id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<string | null>(null);

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const onPick = (docType: string) => {
    setPending(docType);
    fileRef.current?.click();
  };

  const onFile = async (file?: File) => {
    if (!file || !pending) return;
    const docType = pending;
    try {
      await upload.mutateAsync({ docType, file, folder: employee.code });
      toast.success(`${docType} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload document. Try again.');
    } finally {
      setPending(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Missing Documents</CardTitle></CardHeader>
        {data.missing.length === 0 ? (
          <EmptyState icon={CheckCircle2} size="sm" title="All documents on file" description="Nothing outstanding for this employee." />
        ) : (
          <ul className="divide-y divide-line">
            {data.missing.map((doc) => (
              <li key={doc} className="flex items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-2 text-sm text-content"><FileText size={16} className="text-danger" /> {doc}</span>
                <Button size="sm" variant="outline" icon={Upload} loading={upload.isPending && pending === doc} onClick={() => onPick(doc)}>Upload</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle>On File</CardTitle></CardHeader>
        {data.uploaded.length === 0 ? (
          <p className="py-4 text-sm text-content-muted">No documents uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.uploaded.map((doc) => (
              <li key={doc} className="flex items-center gap-2 py-3 text-sm text-content"><CheckCircle2 size={16} className="text-success-strong" /> {doc}</li>
            ))}
          </ul>
        )}
      </Card>

      <input ref={fileRef} type="file" className="hidden" onChange={(ev) => onFile(ev.target.files?.[0])} />
    </div>
  );
}
