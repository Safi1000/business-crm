import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsApi, type ClientFilters } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { Client } from '@/types';

export function useClients(filters: ClientFilters) {
  return useQuery({ queryKey: qk.clients(filters), queryFn: () => clientsApi.list(filters) });
}

export function useClient(id: string) {
  return useQuery({ queryKey: qk.client(id), queryFn: () => clientsApi.get(id), enabled: !!id });
}

export function useClientContracts(id: string) {
  return useQuery({ queryKey: qk.clientContracts(id), queryFn: () => clientsApi.contracts(id), enabled: !!id });
}

export function useClientInvoices(id: string) {
  return useQuery({ queryKey: qk.clientInvoices(id), queryFn: () => clientsApi.invoices(id), enabled: !!id });
}

export function useClientMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['clients'] });

  const create = useMutation({
    mutationFn: (data: Partial<Client>) => clientsApi.create(data),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => clientsApi.update(id, data),
    onSuccess: (_d, v) => {
      invalidate();
      qc.invalidateQueries({ queryKey: qk.client(v.id) });
    },
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Client['status'] }) => clientsApi.setStatus(id, status),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, setStatus, remove };
}
