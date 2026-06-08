import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotesApi, type QuoteFilters } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { Quote } from '@/types';

export function useQuotes(filters: QuoteFilters) {
  return useQuery({ queryKey: qk.quotes(filters), queryFn: () => quotesApi.list(filters) });
}

export function useQuoteMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['quotes'] });
    qc.invalidateQueries({ queryKey: ['invoices'] });
  };
  const setStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: Quote['status'] }) => quotesApi.setStatus(id, status), onSuccess: invalidate });
  const convert = useMutation({ mutationFn: (id: string) => quotesApi.convert(id), onSuccess: invalidate });
  return { setStatus, convert };
}
