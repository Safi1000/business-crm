import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, FormField } from '@ds/primitives';
import { useFormatMoney } from '@/shared';
import { dateField, strictOptionalText } from '@/lib/validation';
import { financeApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import { useInvoiceMutations } from '../hooks/useInvoices';
import type { Invoice } from '@/types';

const schema = z
  .object({
    amount: z.coerce.number().positive('Enter an amount greater than zero'),
    date: dateField(true, 'Date'),
    method: z.enum(['Cash', 'Cheque', 'Bank Transfer']),
    reference: strictOptionalText,
    bankId: z.string().optional(),
    chequeNumber: strictOptionalText,
  })
  .superRefine((v, ctx) => {
    // Non-cash payments must land in a real account.
    if (v.method !== 'Cash' && !v.bankId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select the bank account', path: ['bankId'] });
    }
    if (v.method === 'Cheque' && !(v.chequeNumber ?? '').trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cheque number is required', path: ['chequeNumber'] });
    }
  });
type FormValues = z.infer<typeof schema>;

export function RecordPaymentModal({
  open,
  onClose,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
}) {
  const money = useFormatMoney();
  const { recordPayment } = useInvoiceMutations();
  const { data: banks = [] } = useQuery({ queryKey: qk.banks, queryFn: financeApi.banks });
  const outstanding = invoice.total - invoice.received;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      amount: outstanding,
      date: new Date().toISOString().slice(0, 10),
      method: 'Bank Transfer',
      bankId: '',
    },
  });

  const method = watch('method');

  const onInvalid = () => toast.error('Please fix the highlighted fields before saving.');

  const onSubmit = async (v: FormValues) => {
    try {
      await recordPayment.mutateAsync({
        id: invoice.id,
        payment: { amount: v.amount, date: v.date, method: v.method, reference: v.reference ?? '', recordedBy: 'Faisal Malik' },
        bankId: v.bankId || undefined,
        chequeNumber: v.chequeNumber || undefined,
      });
      toast.success(v.method === 'Cheque' ? 'Payment recorded — cheque added as Pending' : 'Payment recorded');
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not record payment. Try again.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Payment"
      description={`${invoice.number} · Outstanding ${money(outstanding)}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit, onInvalid)} loading={recordPayment.isPending}>Record Payment</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
        <FormField label="Amount" required error={errors.amount?.message}>
          <Input type="number" invalid={!!errors.amount} {...register('amount')} />
        </FormField>
        <FormField label="Date" required error={errors.date?.message}>
          <Input type="date" {...register('date')} />
        </FormField>
        <FormField label="Method">
          <Select
            options={['Bank Transfer', 'Cash', 'Cheque'].map((m) => ({ value: m, label: m }))}
            {...register('method')}
          />
        </FormField>
        <FormField label="Bank / Account" required={method !== 'Cash'} error={errors.bankId?.message}>
          <Select
            placeholder={method === 'Cash' ? 'Not required for cash' : 'Select account…'}
            disabled={method === 'Cash'}
            options={banks.map((b) => ({ value: b.id, label: b.name }))}
            invalid={!!errors.bankId}
            {...register('bankId')}
          />
        </FormField>
        {method === 'Cheque' && (
          <FormField label="Cheque Number" required error={errors.chequeNumber?.message}>
            <Input placeholder="000123" invalid={!!errors.chequeNumber} {...register('chequeNumber')} />
          </FormField>
        )}
        <FormField label="Reference" error={errors.reference?.message} className="sm:col-span-2">
          <Input placeholder="TXN-123456" {...register('reference')} />
        </FormField>
      </form>
    </Modal>
  );
}
