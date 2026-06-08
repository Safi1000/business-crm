import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeApi, expensesApi, type ExpenseFilters } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { BankAccount, Expense } from '@/types';

export function useBanks() {
  return useQuery({ queryKey: qk.banks, queryFn: financeApi.banks });
}
export function useCheques() {
  return useQuery({ queryKey: qk.cheques, queryFn: financeApi.cheques });
}
export function useReceivables() {
  return useQuery({ queryKey: qk.receivables, queryFn: financeApi.receivables });
}
export function useVendors() {
  return useQuery({ queryKey: qk.vendors, queryFn: financeApi.vendors });
}
export function useCashflow() {
  return useQuery({ queryKey: qk.cashflow, queryFn: financeApi.cashflow });
}
export function useAddBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Partial<BankAccount>) => financeApi.addBank(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.banks }),
  });
}

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({ queryKey: qk.expenses(filters), queryFn: () => expensesApi.list(filters) });
}
export function useExpenseBreakdown() {
  return useQuery({ queryKey: qk.expenseBreakdown, queryFn: expensesApi.categoryBreakdown });
}
export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Partial<Expense>) => expensesApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
