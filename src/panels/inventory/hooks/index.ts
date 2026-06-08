import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, type ItemFilters, type MovementFilters } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { Item, StockMovement } from '@/types';

export function useItems(filters: ItemFilters) {
  return useQuery({ queryKey: qk.items(filters), queryFn: () => inventoryApi.items(filters) });
}
export function useMovements(filters: MovementFilters) {
  return useQuery({ queryKey: qk.movements(filters), queryFn: () => inventoryApi.movements(filters) });
}
export function useInventoryMutations() {
  const qc = useQueryClient();
  const addItem = useMutation({ mutationFn: (d: Partial<Item>) => inventoryApi.addItem(d), onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }) });
  const addMovement = useMutation({
    mutationFn: (d: Partial<StockMovement>) => inventoryApi.addMovement(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movements'] }); qc.invalidateQueries({ queryKey: ['items'] }); },
  });
  return { addItem, addMovement };
}
