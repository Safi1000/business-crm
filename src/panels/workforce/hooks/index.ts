import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  employeesApi,
  attendanceApi,
  payrollApi,
  leavesApi,
  settingsApi,
  type EmployeeFilters,
} from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { AttendanceMark, Employee, Payslip } from '@/types';

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({ queryKey: qk.employees(filters), queryFn: () => employeesApi.list(filters) });
}
export function useEmployee(id: string) {
  return useQuery({ queryKey: qk.employee(id), queryFn: () => employeesApi.get(id), enabled: !!id });
}
export function useBranches() {
  return useQuery({ queryKey: qk.branches, queryFn: settingsApi.branches });
}
export function useDepartments() {
  return useQuery({ queryKey: qk.departments, queryFn: settingsApi.departments });
}
export function useManagers() {
  return useQuery({ queryKey: ['managers'], queryFn: employeesApi.managers });
}

export function useEmployeeMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['employees'] });
  const create = useMutation({ mutationFn: (d: Partial<Employee>) => employeesApi.create(d), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) => employeesApi.update(id, data),
    onSuccess: (_d, v) => {
      invalidate();
      qc.invalidateQueries({ queryKey: qk.employee(v.id) });
    },
  });
  return { create, update };
}

export function useAttendanceToday(filters: Parameters<typeof attendanceApi.today>[0]) {
  return useQuery({ queryKey: qk.attendanceToday(filters), queryFn: () => attendanceApi.today(filters) });
}
export function useAttendanceMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['attendance'] });
  const mark = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AttendanceMark }) => attendanceApi.mark(id, status),
    onSuccess: invalidate,
  });
  const markAll = useMutation({ mutationFn: (ids: string[]) => attendanceApi.markAllPresent(ids), onSuccess: invalidate });
  return { mark, markAll };
}

export function usePayroll(filters: Parameters<typeof payrollApi.list>[0]) {
  return useQuery({ queryKey: qk.payroll(filters), queryFn: () => payrollApi.list(filters) });
}
export function usePayrollMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['payroll'] });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payslip> }) => payrollApi.update(id, data),
    onSuccess: invalidate,
  });
  const disburseAll = useMutation({ mutationFn: () => payrollApi.disburseAll(), onSuccess: invalidate });
  return { update, disburseAll };
}

export function useLeaves() {
  return useQuery({ queryKey: qk.leaves, queryFn: leavesApi.list });
}
export function useAdvances() {
  return useQuery({ queryKey: qk.advances, queryFn: leavesApi.advances });
}
export function useLeaveMutations() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Approved' | 'Rejected' | 'Pending' }) =>
      leavesApi.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.leaves }),
  });
  return { setStatus };
}
