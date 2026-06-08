import { useQuery } from '@tanstack/react-query';
import { clientsApi, projectsApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';

/** The logged-in client is pinned to a fixture for this demo portal. */
export const CLIENT_ID = 'cli-1';

export function useMyClient() {
  return useQuery({ queryKey: qk.client(CLIENT_ID), queryFn: () => clientsApi.get(CLIENT_ID) });
}
export function useMyInvoices() {
  return useQuery({ queryKey: qk.clientInvoices(CLIENT_ID), queryFn: () => clientsApi.invoices(CLIENT_ID) });
}
export function useMyContracts() {
  return useQuery({ queryKey: qk.clientContracts(CLIENT_ID), queryFn: () => clientsApi.contracts(CLIENT_ID) });
}
export function useMyProjects() {
  return useQuery({ queryKey: ['cp-projects', CLIENT_ID], queryFn: () => projectsApi.list({ client: CLIENT_ID, pageSize: 100 }) });
}
