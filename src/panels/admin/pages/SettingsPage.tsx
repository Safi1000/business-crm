import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Building2, GitBranch, Users2, LayoutGrid, FileText, Mail, Bot, Plug, Bell, Globe, DatabaseBackup,
} from 'lucide-react';
import { PageHeader } from '@/shared';
import { Button, Input, Select, FormField, Card, CardTitle, Toggle } from '@ds/primitives';
import { EmptyState, toast } from '@ds/feedback';
import { cn } from '@/lib/cn';
import { useCompany, useUpdateCompany, useBranchesQuery, useDepartmentsQuery } from '../hooks';

const SECTIONS = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'branches', label: 'Branches', icon: GitBranch },
  { id: 'departments', label: 'Departments', icon: Users2 },
  { id: 'dashboard', label: 'Dashboard Widgets', icon: LayoutGrid },
  { id: 'invoice', label: 'Invoice Template', icon: FileText },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'country', label: 'Country Packs', icon: Globe },
  { id: 'backup', label: 'Backup & Audit', icon: DatabaseBackup },
];

export function SettingsPage() {
  const [section, setSection] = useState('company');
  const { data: company } = useCompany();
  const { data: branches = [] } = useBranchesQuery();
  const { data: departments = [] } = useDepartmentsQuery();
  const update = useUpdateCompany();
  const { register, handleSubmit, reset } = useForm({ defaultValues: company });
  useEffect(() => { if (company) reset(company); }, [company, reset]);

  return (
    <div>
      <PageHeader title="Settings" description="Company configuration and platform preferences." />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                section === s.id ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-950/40' : 'text-content-muted hover:bg-surface-sunken hover:text-content',
              )}
            >
              <s.icon size={16} /> {s.label}
            </button>
          ))}
        </aside>

        <div>
          {section === 'company' && (
            <Card>
              <CardTitle className="mb-4">Company Profile</CardTitle>
              <form onSubmit={handleSubmit(async (v) => { await update.mutateAsync(v); toast.success('Company profile saved'); })} className="grid gap-4 sm:grid-cols-2">
                <FormField label="Company Name" className="sm:col-span-2"><Input {...register('name')} /></FormField>
                <FormField label="Legal Address" className="sm:col-span-2"><Input {...register('legalAddress')} /></FormField>
                <FormField label="Tax ID (NTN)"><Input {...register('taxId')} /></FormField>
                <FormField label="Presentation Currency"><Select options={['PKR', 'USD', 'EUR', 'GBP', 'AED'].map((c) => ({ value: c, label: c }))} {...register('presentationCurrency')} /></FormField>
                <FormField label="Fiscal Year Start"><Select options={['January', 'April', 'July', 'October'].map((m) => ({ value: m, label: m }))} {...register('fiscalYearStart')} /></FormField>
                <div className="sm:col-span-2"><Button type="submit" loading={update.isPending}>Save Changes</Button></div>
              </form>
            </Card>
          )}

          {section === 'branches' && (
            <Card>
              <div className="mb-4 flex items-center justify-between"><CardTitle>Branches</CardTitle><Button size="sm" variant="outline" onClick={() => toast.info('Add branch (stub)')}>Add Branch</Button></div>
              <div className="divide-y divide-line">
                {branches.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-content">{b.name}</p><p className="text-xs text-content-muted">{b.city}</p></div></div>
                ))}
              </div>
            </Card>
          )}

          {section === 'departments' && (
            <Card>
              <div className="mb-4 flex items-center justify-between"><CardTitle>Departments</CardTitle><Button size="sm" variant="outline" onClick={() => toast.info('Add department (stub)')}>Add Department</Button></div>
              <div className="flex flex-wrap gap-2">
                {departments.map((d) => <span key={d.id} className="rounded-lg bg-surface-sunken px-3 py-1.5 text-sm">{d.name}</span>)}
              </div>
            </Card>
          )}

          {section === 'dashboard' && (
            <Card>
              <CardTitle className="mb-4">Dashboard Widgets</CardTitle>
              <div className="space-y-3">
                {['Total Employees', 'Attendance Today', 'Total Expenses MTD', 'Payroll MTD', 'Bank Overview', 'Revenue by Client'].map((w, i) => (
                  <div key={w} className="flex items-center justify-between"><span className="text-sm text-content">{w}</span><Toggle checked={i < 4} onChange={() => toast.success('Widget preference saved')} /></div>
                ))}
              </div>
            </Card>
          )}

          {section === 'integrations' && (
            <div className="space-y-4">
              <Card>
                <CardTitle className="mb-4">Time Tracking</CardTitle>
                <div className="space-y-3">
                  {['Jibble', 'Truein', 'Hubstaff'].map((p, i) => (
                    <div key={p} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                      <div><p className="font-medium text-content">{p}</p><p className="text-xs text-content-muted">Activating switches Attendance to integrated mode.</p></div>
                      <Toggle checked={i === 0} onChange={() => toast.info('Integration toggle (stub)')} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {section === 'country' && (
            <Card>
              <CardTitle className="mb-4">Country Packs</CardTitle>
              <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                <div><p className="font-medium text-content">Pakistan</p><p className="text-xs text-content-muted">CNIC, EOBI, NTN/STRN, filer status, statutory payroll rules.</p></div>
                <Toggle checked onChange={() => undefined} />
              </div>
            </Card>
          )}

          {['invoice', 'email', 'ai', 'notifications', 'backup'].includes(section) && (
            <EmptyState
              icon={SECTIONS.find((s) => s.id === section)!.icon}
              title={SECTIONS.find((s) => s.id === section)!.label}
              description="Configuration for this section. Wiring its controls is part of the ongoing build."
            />
          )}
        </div>
      </div>
    </div>
  );
}
