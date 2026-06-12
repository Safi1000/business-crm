import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, Textarea, FormField, CollapsibleSection } from '@ds/primitives';
import { getCountryPack } from '@/config/countryPacks';
import { useClientMutations } from '../hooks/useClients';
import type { Client } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Client name is required'),
  type: z.enum(['Business', 'Individual']),
  industry: z.string().min(1, 'Industry is required'),
  country: z.string().min(1),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  strn: z.string().optional(),
  filerStatus: z.enum(['Filer', 'Non-Filer']).optional(),
  withholdingRate: z.coerce.number().min(0).max(100).optional(),
  currency: z.enum(['PKR', 'USD', 'EUR', 'GBP', 'AED']),
  billingAddress: z.string().optional(),
  paymentTermsDays: z.coerce.number().min(0),
  creditLimit: z.coerce.number().min(0).optional(),
});
type FormValues = z.infer<typeof schema>;

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass a client to edit; omit to create. */
  client?: Client;
  /** Navigate to detail after a quick-create. */
  onCreated?: (client: Client) => void;
}

export function ClientFormModal({ open, onClose, client, onCreated }: ClientFormModalProps) {
  const isEdit = !!client;
  const { create, update } = useClientMutations();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'Business',
      country: 'Pakistan',
      currency: 'PKR',
      paymentTermsDays: 30,
      industry: '',
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        client
          ? {
              name: client.name,
              type: client.type,
              industry: client.industry,
              country: client.country,
              email: client.email,
              phone: client.phone,
              taxId: client.taxId,
              strn: client.strn,
              filerStatus: client.filerStatus,
              withholdingRate: client.withholdingRate,
              currency: client.currency,
              billingAddress: client.billingAddress,
              paymentTermsDays: client.paymentTermsDays,
              creditLimit: client.creditLimit,
            }
          : {
              type: 'Business',
              country: 'Pakistan',
              currency: 'PKR',
              paymentTermsDays: 30,
              industry: 'Technology',
              name: '',
              email: '',
            },
      );
    }
  }, [open, client, reset]);

  const country = watch('country') ?? 'Pakistan';
  const pack = getCountryPack(country);

  const onValid = async (values: FormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: client.id, data: values });
        toast.success('Client updated');
      } else {
        const created = await create.mutateAsync(values);
        toast.success('Client created');
        onCreated?.(created);
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save. Try again.';
      toast.error(message);
    }
  };

  // Shake the form on invalid submit (brief: shake on failed required-field save).
  const onInvalid = () => {
    formRef.current?.classList.remove('animate-shake');
    void formRef.current?.offsetWidth;
    formRef.current?.classList.add('animate-shake');
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
      title={isEdit ? `Edit Client ${client.code}` : 'Create Client'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onValid, onInvalid)} loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Client'}
          </Button>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit(onValid, onInvalid)} className="space-y-3">
        <CollapsibleSection title="Basic Information" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Client Name" required error={errors.name?.message} className="sm:col-span-2">
              <Input placeholder="Acme Corporation" invalid={!!errors.name} {...register('name')} />
            </FormField>
            <FormField label="Type">
              <Select
                options={[
                  { value: 'Business', label: 'Business' },
                  { value: 'Individual', label: 'Individual' },
                ]}
                {...register('type')}
              />
            </FormField>
            <FormField label="Industry" required error={errors.industry?.message}>
              <Input placeholder="Technology" invalid={!!errors.industry} {...register('industry')} />
            </FormField>
            <FormField label="Country">
              <Select options={[{ value: 'Pakistan', label: 'Pakistan' }]} {...register('country')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="accounts@acme.com" invalid={!!errors.email} {...register('email')} />
            </FormField>
            <FormField label="Phone">
              <Input placeholder="+92 21 12345678" {...register('phone')} />
            </FormField>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Tax & Compliance" description={`${pack.taxIdLabel}, ${pack.country} statutory fields`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={`Tax ID / ${pack.taxIdLabel}`}>
              <Input placeholder="1234567-8" {...register('taxId')} />
            </FormField>
            {pack.clientFields.map((f) =>
              f.type === 'select' ? (
                <FormField key={f.name} label={f.label}>
                  <Select
                    placeholder="Select…"
                    options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                    {...register(f.name as keyof FormValues)}
                  />
                </FormField>
              ) : (
                <FormField key={f.name} label={f.label}>
                  <Input placeholder={f.placeholder} {...register(f.name as keyof FormValues)} />
                </FormField>
              ),
            )}
            <FormField label="Withholding Tax Rate (%)">
              <Input type="number" step="0.1" placeholder="0" {...register('withholdingRate')} />
            </FormField>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Billing">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Default Currency">
              <Select
                options={['PKR', 'USD', 'EUR', 'GBP', 'AED'].map((c) => ({ value: c, label: c }))}
                {...register('currency')}
              />
            </FormField>
            <FormField label="Payment Terms (days)">
              <Input type="number" {...register('paymentTermsDays')} />
            </FormField>
            <FormField label="Credit Limit">
              <Input type="number" placeholder="0" {...register('creditLimit')} />
            </FormField>
            <FormField label="Billing Address" className="sm:col-span-2">
              <Textarea rows={2} placeholder="Street, city, country" {...register('billingAddress')} />
            </FormField>
          </div>
        </CollapsibleSection>
      </form>
    </Modal>
  );
}
