import { useQuery } from '@tanstack/react-query';
import { employeesApi, payrollApi, leavesApi, tasksApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';

/** The logged-in employee is pinned to a fixture for this demo portal. */
export const EMPLOYEE_ID = 'emp-1';

export function useMe() {
  return useQuery({ queryKey: qk.employee(EMPLOYEE_ID), queryFn: () => employeesApi.get(EMPLOYEE_ID) });
}
export function useMyPayslips() {
  return useQuery({ queryKey: ['ep-payslips'], queryFn: async () => (await payrollApi.list({})).filter((p) => p.employeeId === EMPLOYEE_ID) });
}
export function useMyLeaves() {
  return useQuery({ queryKey: ['ep-leaves'], queryFn: async () => (await leavesApi.list()).filter((l) => l.employeeId === EMPLOYEE_ID) });
}
export function useMyTasks(name: string | undefined) {
  return useQuery({ queryKey: ['ep-tasks', name], queryFn: () => tasksApi.list({ assignee: name }), enabled: !!name });
}
