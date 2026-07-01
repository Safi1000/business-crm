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
import type { AttendanceSnapshot } from '@/data/mock-api/workforce';
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
  const remove = useMutation({
    mutationFn: (id: string) => employeesApi.remove(id),
    onSuccess: (_d, id) => {
      invalidate();
      qc.invalidateQueries({ queryKey: qk.employee(id) });
    },
  });
  return { create, update, remove };
}

export function useEmployeeDocuments(id: string) {
  return useQuery({ queryKey: ['employee-docs', id], queryFn: () => employeesApi.documents(id), enabled: !!id });
}
export function useEmployeeDocMutations(id: string) {
  const qc = useQueryClient();
  const upload = useMutation({
    mutationFn: ({ docType, file, folder }: { docType: string; file: File; folder: string }) => employeesApi.uploadDocument(id, docType, file, folder),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee-docs', id] });
      qc.invalidateQueries({ queryKey: qk.employee(id) });
      qc.invalidateQueries({ queryKey: ['employees'] });
    },
  });
  return { upload };
}

export function useAttendanceToday(filters: Parameters<typeof attendanceApi.today>[0]) {
  return useQuery({ queryKey: qk.attendanceToday(filters), queryFn: () => attendanceApi.today(filters) });
}
export function useAttendanceMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['attendance'] });
  const mark = useMutation({
    mutationFn: ({ id, status, date }: { id: string; status: AttendanceMark; date?: string }) => attendanceApi.mark(id, status, date),
    onSuccess: invalidate,
  });
  const markAll = useMutation({ mutationFn: ({ ids, date }: { ids: string[]; date?: string }) => attendanceApi.markAllPresent(ids, date), onSuccess: invalidate });
  const revert = useMutation({ mutationFn: ({ snapshot, date }: { snapshot: AttendanceSnapshot[]; date?: string }) => attendanceApi.revert(snapshot, date), onSuccess: invalidate });
  return { mark, markAll, revert };
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
  const generate = useMutation({ mutationFn: (month?: string) => payrollApi.generate(month), onSuccess: invalidate });
  return { update, disburseAll, generate };
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
