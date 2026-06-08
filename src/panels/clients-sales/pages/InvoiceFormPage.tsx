import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import { PageHeader, useFormatMoney } from '@/shared';
import { Button, Card, CardTitle, Input, Select, Textarea, FormField } from '@ds/primitives';
import { toast } from '@ds/feedback';
import { useClients } from '../hooks/useClients';
import { useInvoice, useInvoiceMutations } from '../hooks/useInvoices';
import { routes } from '@/config/routes';

interface LineItemForm {
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
}
interface InvoiceForm {
  clientId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  withholdingTax: number;
  notes: string;
  terms: string;
  lineItems: LineItemForm[];
}

const blankLine: LineItemForm = { description: '', quantity: 1, rate: 0, taxRate: 0 };

export function InvoiceFormPage() {
  const navigate = useNavigate();
  const money = useFormatMoney();
  const { id } = useParams();
  const [params] = useSearchParams();
  const isEdit = !!id;

  const { data: clientsData } = useClients({ pageSize: 1000, status: 'Active' });
  const { data: existing } = useInvoice(id ?? '');
  const { create, update } = useInvoiceMutations();

  const { register, control, watch, reset, formState: { errors } } = useForm<InvoiceForm>({
    defaultValues: {
      clientId: params.get('client') ?? '',
      number: '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      withholdingTax: 0,
      notes: '',
      terms: 'Payment due within terms. Late payments subject to 2% monthly surcharge.',
      lineItems: [blankLine],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });

  useEffect(() => {
    if (existing) {
      reset({
        clientId: existing.clientId,
        number: existing.number,
        issueDate: existing.issueDate,
        dueDate: existing.dueDate,
        withholdingTax: existing.withholdingTax,
        notes: existing.notes ?? '',
        terms: existing.terms ?? '',
        lineItems: existing.lineItems.map((li) => ({ description: li.description, quantity: li.quantity, rate: li.rate, taxRate: li.taxRate })),
      });
    }
  }, [existing, reset]);

  const watched = watch();
  const clientId = watched.clientId;

  const totals = useMemo(() => {
    const lines = watched.lineItems ?? [];
    const subtotal = lines.reduce((s, li) => s + (Number(li.quantity) || 0) * (Number(li.rate) || 0), 0);
    const tax = lines.reduce((s, li) => s + ((Number(li.quantity) || 0) * (Number(li.rate) || 0) * (Number(li.taxRate) || 0)) / 100, 0);
    const wht = Number(watched.withholdingTax) || 0;
    return { subtotal, tax, wht, total: subtotal + tax - wht };
  }, [watched]);

  const save = async (status: 'Draft' | 'Sent') => {
    if (!clientId) {
      toast.error('Pick a client first.');
      return;
    }
    const client = clientsData?.rows.find((c) => c.id === clientId);
    const payload = {
      clientId,
      clientName: client?.name ?? '',
      clientCode: client?.code ?? '',
      number: watched.number || undefined,
      issueDate: watched.issueDate,
      dueDate: watched.dueDate,
      withholdingTax: Number(watched.withholdingTax) || 0,
      notes: watched.notes,
      terms: watched.terms,
      status,
      lineItems: (watched.lineItems ?? []).map((li, idx) => ({ id: `li-${idx}`, ...li, quantity: Number(li.quantity), rate: Number(li.rate), taxRate: Number(li.taxRate) })),
    };
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, data: payload });
        toast.success('Invoice updated');
      } else {
        await create.mutateAsync(payload);
        toast.success(status === 'Sent' ? 'Invoice saved & sent' : 'Draft saved');
      }
      navigate(routes.invoices);
    } catch {
      toast.error('Could not save. Try again.');
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <div>
      <button onClick={() => navigate(routes.invoices)} className="mb-3 flex items-center gap-1.5 text-sm text-content-muted hover:text-content">
        <ArrowLeft size={16} /> Back to Invoices
      </button>
      <PageHeader
        title={isEdit ? `Edit ${existing?.number ?? 'Invoice'}` : 'New Invoice'}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(routes.invoices)}>Cancel</Button>
            <Button variant="outline" icon={Save} loading={saving} onClick={() => save('Draft')}>Save as Draft</Button>
            <Button icon={Send} loading={saving} onClick={() => save('Sent')}>Save & Send</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle className="mb-4">Details</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Client" required className="sm:col-span-2" error={!clientId ? undefined : undefined}>
                <Select
                  placeholder="Select a client…"
                  value={clientId}
                  options={(clientsData?.rows ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                  {...register('clientId')}
                />
              </FormField>
              <FormField label="Invoice Number"><Input placeholder="Auto" {...register('number')} /></FormField>
              <FormField label="Issue Date"><Input type="date" {...register('issueDate')} /></FormField>
              <FormField label="Due Date"><Input type="date" {...register('dueDate')} /></FormField>
            </div>
          </Card>

          <Card padding="none">
            <div className="flex items-center justify-between p-5 pb-3">
              <CardTitle>Line Items</CardTitle>
              <Button size="sm" variant="outline" icon={Plus} onClick={() => append(blankLine)} disabled={!clientId}>Add row</Button>
            </div>
            {!clientId ? (
              <p className="px-5 pb-6 text-sm text-content-muted">Pick a client first to add line items.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-line bg-surface-sunken/60 text-left text-2xs uppercase tracking-wide text-content-subtle">
                      <th className="px-4 py-2.5">Description</th>
                      <th className="w-20 px-2 py-2.5">Qty</th>
                      <th className="w-32 px-2 py-2.5">Rate</th>
                      <th className="w-20 px-2 py-2.5">Tax %</th>
                      <th className="w-32 px-2 py-2.5 text-right">Total</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f, idx) => {
                      const li = watched.lineItems?.[idx];
                      const lineTotal = (Number(li?.quantity) || 0) * (Number(li?.rate) || 0);
                      const negative = (Number(li?.quantity) || 0) < 0;
                      return (
                        <tr key={f.id} className="border-b border-line last:border-0">
                          <td className="px-4 py-2"><Input sizeVariant="sm" placeholder="Service description" {...register(`lineItems.${idx}.description`)} /></td>
                          <td className="px-2 py-2"><Input sizeVariant="sm" type="number" invalid={negative} {...register(`lineItems.${idx}.quantity`)} /></td>
                          <td className="px-2 py-2"><Input sizeVariant="sm" type="number" {...register(`lineItems.${idx}.rate`)} /></td>
                          <td className="px-2 py-2"><Input sizeVariant="sm" type="number" {...register(`lineItems.${idx}.taxRate`)} /></td>
                          <td className="nums px-2 py-2 text-right font-medium">{money(lineTotal)}</td>
                          <td className="px-2 py-2">
                            <Button size="sm" variant="ghost" icon={Trash2} aria-label="Remove" onClick={() => remove(idx)} disabled={fields.length === 1} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle className="mb-4">Notes & Terms</CardTitle>
            <div className="space-y-4">
              <FormField label="Notes"><Textarea rows={2} placeholder="Visible on the invoice" {...register('notes')} /></FormField>
              <FormField label="Terms & Conditions"><Textarea rows={2} {...register('terms')} /></FormField>
            </div>
          </Card>
        </div>

        {/* Totals panel */}
        <div>
          <Card className="sticky top-[88px]">
            <CardTitle className="mb-4">Summary</CardTitle>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-content-muted">Subtotal</dt><dd className="nums font-medium">{money(totals.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-content-muted">Tax</dt><dd className="nums font-medium">{money(totals.tax)}</dd></div>
              <FormField label="Withholding Tax">
                <Input type="number" sizeVariant="sm" {...register('withholdingTax')} />
              </FormField>
              <div className="flex justify-between border-t border-line pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="nums font-bold text-brand-600">{money(totals.total)}</dd></div>
            </dl>
            {errors.clientId && <p className="mt-3 text-xs text-danger">Select a client to continue.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
