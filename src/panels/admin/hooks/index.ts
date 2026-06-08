import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, settingsApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { AppUser, CompanyProfile } from '@/types';

export function useUsers(search: string) {
  return useQuery({ queryKey: qk.users(search), queryFn: () => usersApi.list(search) });
}
export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });
  const create = useMutation({ mutationFn: (d: Partial<AppUser>) => usersApi.create(d), onSuccess: invalidate });
  const update = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<AppUser> }) => usersApi.update(id, data), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => usersApi.remove(id), onSuccess: invalidate });
  return { create, update, remove };
}

export function useCompany() {
  return useQuery({ queryKey: qk.company, queryFn: settingsApi.company });
}
export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Partial<CompanyProfile>) => settingsApi.updateCompany(d), onSuccess: () => qc.invalidateQueries({ queryKey: qk.company }) });
}
export function useBranchesQuery() {
  return useQuery({ queryKey: qk.branches, queryFn: settingsApi.branches });
}
export function useDepartmentsQuery() {
  return useQuery({ queryKey: qk.departments, queryFn: settingsApi.departments });
}
