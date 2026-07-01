import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, FormField, CollapsibleSection } from '@ds/primitives';
import { getCountryPack } from '@/config/countryPacks';
import { personName, emailOptional, phoneField, cnicField, dateField, numberField, freeText, strictOptionalText } from '@/lib/validation';
import { useBranches, useDepartments, useEmployeeMutations, useManagers } from '../hooks';
import type { Employee } from '@/types';

const schema = z.object({
  name: personName('Full name'),
  email: emailOptional,
  phone: phoneField(),
  dob: dateField(false, 'Date of birth'),
  country: z.string().min(1),
  address: freeText,
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
  departmentId: z.string().min(1, 'Department is required'),
  branchId: z.string().min(1, 'Branch is required'),
  reportingTo: z.string().optional(),
  joinDate: dateField(true, 'Join date'),
  shift: z.enum(['Morning', 'Evening', 'Night']),
  baseSalary: numberField({ min: 0, label: 'Salary' }),
  currency: z.enum(['PKR', 'USD', 'EUR', 'GBP', 'AED']),
  bankName: strictOptionalText,
  iban: strictOptionalText,
  cnic: cnicField(),
  eobiNo: strictOptionalText,
});
type FormValues = z.infer<typeof schema>;

export function EmployeeFormModal({
  open,
  onClose,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
}) {
  const isEdit = !!employee;
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const { data: managers = [] } = useManagers();
  const { create, update } = useEmployeeMutations();
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { country: 'Pakistan', type: 'Full-time', shift: 'Morning', currency: 'PKR', baseSalary: 0, name: '', email: '', departmentId: '', branchId: '', joinDate: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (open) {
      reset(
        employee
          ? { ...employee, dob: employee.dob ?? '', address: employee.address ?? '' }
          : { country: 'Pakistan', type: 'Full-time', shift: 'Morning', currency: 'PKR', baseSalary: 0, name: '', email: '', departmentId: departments[0]?.id ?? '', branchId: branches[0]?.id ?? '', joinDate: new Date().toISOString().slice(0, 10) },
      );
    }
  }, [open, employee, reset, branches, departments]);

  const pack = getCountryPack(watch('country') ?? 'Pakistan');
  const perDay = Math.round((Number(watch('baseSalary')) || 0) / 26);

  const onValid = async (v: FormValues) => {
    const dept = departments.find((d) => d.id === v.departmentId);
    const branch = branches.find((b) => b.id === v.branchId);
    try {
      const data = { ...v, department: dept?.name, branch: branch?.name };
      if (isEdit) {
        await update.mutateAsync({ id: employee.id, data });
        toast.success('Employee updated');
      } else {
        await create.mutateAsync(data);
        toast.success('Employee added');
      }
      onClose();
    } catch {
      toast.error('Could not save. Try again.');
    }
  };

  const onInvalid = () => {
    formRef.current?.classList.remove('animate-shake');
    void formRef.current?.offsetWidth;
    formRef.current?.classList.add('animate-shake');
    toast.error('Please fix the highlighted fields before saving.');
  };

  const handleClose = () => {
    if (isDirty && !confirm('Discard changes?')) return;
    onClose();
  };

  const saving = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? `Edit Employee ${employee.code}` : 'Add Employee'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit(onValid, onInvalid)} loading={saving}>{isEdit ? 'Save Changes' : 'Add Employee'}</Button>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-3">
        <CollapsibleSection title="Basic Information" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" required error={errors.name?.message} className="sm:col-span-2">
              <Input invalid={!!errors.name} {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}><Input type="email" invalid={!!errors.email} {...register('email')} /></FormField>
            <FormField label="Phone" error={errors.phone?.message}><Input invalid={!!errors.phone} {...register('phone')} /></FormField>
            <FormField label="Date of Birth" error={errors.dob?.message}><Input type="date" invalid={!!errors.dob} {...register('dob')} /></FormField>
            <FormField label="Country"><Select options={[{ value: 'Pakistan', label: 'Pakistan' }]} {...register('country')} /></FormField>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Employment Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Employee Type"><Select options={['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => ({ value: t, label: t }))} {...register('type')} /></FormField>
            <FormField label="Department" required error={errors.departmentId?.message}><Select placeholder="Select…" options={departments.map((d) => ({ value: d.id, label: d.name }))} {...register('departmentId')} /></FormField>
            <FormField label="Branch" required error={errors.branchId?.message}><Select placeholder="Select…" options={branches.map((b) => ({ value: b.id, label: b.name }))} {...register('branchId')} /></FormField>
            <FormField label="Reporting To" hint="Super Admin this employee reports to"><Select placeholder="None" options={managers.map((m) => ({ value: m.id, label: m.name }))} {...register('reportingTo')} /></FormField>
            <FormField label="Join Date" required error={errors.joinDate?.message}><Input type="date" {...register('joinDate')} /></FormField>
            <FormField label="Shift"><Select options={['Morning', 'Evening', 'Night'].map((s) => ({ value: s, label: s }))} {...register('shift')} /></FormField>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Compensation & Bank">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Base Salary" required error={errors.baseSalary?.message}><Input type="number" invalid={!!errors.baseSalary} {...register('baseSalary')} /></FormField>
            <FormField label="Currency"><Select options={['PKR', 'USD', 'EUR', 'GBP', 'AED'].map((c) => ({ value: c, label: c }))} {...register('currency')} /></FormField>
            <FormField label="Per-day Salary (auto)" hint="Base ÷ 26 working days"><Input value={perDay} disabled readOnly /></FormField>
            <FormField label="Bank Name" error={errors.bankName?.message}><Input placeholder="Meezan Bank" invalid={!!errors.bankName} {...register('bankName')} /></FormField>
            <FormField label="IBAN" error={errors.iban?.message} className="sm:col-span-2"><Input placeholder="PK..." invalid={!!errors.iban} {...register('iban')} /></FormField>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title={`Statutory IDs — ${pack.country}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {pack.employeeFields.map((f) => {
              const err = errors[f.name as keyof FormValues]?.message as string | undefined;
              return (
                <FormField key={f.name} label={f.label} error={err}>
                  <Input placeholder={f.placeholder} invalid={!!err} {...register(f.name as keyof FormValues)} />
                </FormField>
              );
            })}
          </div>
        </CollapsibleSection>
      </form>
    </Modal>
  );
}
