import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';

export function useDashboard() {
  return useQuery({ queryKey: qk.dashboard, queryFn: dashboardApi.get });
}
