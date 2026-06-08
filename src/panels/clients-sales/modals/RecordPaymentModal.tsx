import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, toast } from '@ds/feedback';
import { Button, Input, Select, FormField } from '@ds/primitives';
import { useFormatMoney } from '@/shared';
import { useInvoiceMutations } from '../hooks/useInvoices';
import type { Invoice } from '@/types';

const schema = z.object({
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  date: z.string().min(1, 'Date is required'),
  method: z.enum(['Cash', 'Cheque', 'Bank Transfer']),
  reference: z.string().optional(),
  bank: z.string().optional(),
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
  const outstanding = invoice.total - invoice.received;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: outstanding,
      date: new Date().toISOString().slice(0, 10),
      method: 'Bank Transfer',
    },
  });

  const onSubmit = async (v: FormValues) => {
    try {
      await recordPayment.mutateAsync({
        id: invoice.id,
        payment: { ...v, reference: v.reference ?? '', recordedBy: 'Faisal Malik' },
      });
      toast.success('Payment recorded');
      reset();
      onClose();
    } catch {
      toast.error('Could not record payment. Try again.');
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
          <Button onClick={handleSubmit(onSubmit)} loading={recordPayment.isPending}>Record Payment</Button>
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
        <FormField label="Bank / Account">
          <Input placeholder="Meezan Bank" {...register('bank')} />
        </FormField>
        <FormField label="Reference" className="sm:col-span-2">
          <Input placeholder="TXN-123456" {...register('reference')} />
        </FormField>
      </form>
    </Modal>
  );
}
