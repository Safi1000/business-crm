import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractsApi, type ContractFilters } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { Contract } from '@/types';

export function useContracts(filters: ContractFilters) {
  return useQuery({ queryKey: qk.contracts(filters), queryFn: () => contractsApi.list(filters) });
}

export function useContractMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['contracts'] });
  const create = useMutation({ mutationFn: (d: Partial<Contract>) => contractsApi.create(d), onSuccess: invalidate });
  const renew = useMutation({ mutationFn: ({ id, endDate }: { id: string; endDate: string }) => contractsApi.renew(id, endDate), onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: (id: string) => contractsApi.cancel(id), onSuccess: invalidate });
  const update = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) => contractsApi.update(id, data), onSuccess: invalidate });
  return { create, renew, cancel, update };
}
