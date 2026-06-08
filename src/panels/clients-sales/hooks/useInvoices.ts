import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, type InvoiceFilters } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { Invoice, Payment } from '@/types';

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({ queryKey: qk.invoices(filters), queryFn: () => invoicesApi.list(filters) });
}

export function useInvoice(id: string) {
  return useQuery({ queryKey: qk.invoice(id), queryFn: () => invoicesApi.get(id), enabled: !!id });
}

export function useInvoiceMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['invoices'] });

  const create = useMutation({
    mutationFn: (data: Partial<Invoice>) => invoicesApi.create(data),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => invoicesApi.update(id, data),
    onSuccess: (_d, v) => {
      invalidate();
      qc.invalidateQueries({ queryKey: qk.invoice(v.id) });
    },
  });
  const recordPayment = useMutation({
    mutationFn: ({ id, payment }: { id: string; payment: Omit<Payment, 'id'> }) =>
      invoicesApi.recordPayment(id, payment),
    onSuccess: (_d, v) => {
      invalidate();
      qc.invalidateQueries({ queryKey: qk.invoice(v.id) });
    },
  });
  const setStatus = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: Invoice['status'] }) =>
      invoicesApi.setStatus(ids, status),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (ids: string[]) => invoicesApi.remove(ids),
    onSuccess: invalidate,
  });

  return { create, update, recordPayment, setStatus, remove };
}
