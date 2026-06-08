import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { datesApi, documentsApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { ImportantDate } from '@/types';

export function useImportantDates(filters: { category?: string; search?: string }) {
  return useQuery({ queryKey: qk.importantDates(filters), queryFn: () => datesApi.list(filters) });
}
export function useDateMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['dates'] });
  const create = useMutation({ mutationFn: (d: Partial<ImportantDate>) => datesApi.create(d), onSuccess: invalidate });
  const update = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<ImportantDate> }) => datesApi.update(id, data), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => datesApi.remove(id), onSuccess: invalidate });
  return { create, update, remove };
}

export function useDocFolders() {
  return useQuery({ queryKey: qk.docFolders, queryFn: documentsApi.folders });
}
export function useDocFiles(folderId: string) {
  return useQuery({ queryKey: qk.docFiles(folderId), queryFn: () => documentsApi.files(folderId), enabled: !!folderId });
}
