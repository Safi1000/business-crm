import type { Advance, AttendanceMark, AttendanceRecord, Employee, Leave, Payslip } from '@/types';
import { db } from './db';
import { resolve } from './transport';

export interface AttendanceRow extends AttendanceRecord {
  employee: Employee;
}

export const attendanceApi = {
  today(filters: { branch?: string; department?: string; shift?: string; search?: string; onlyUnmarked?: boolean } = {}): Promise<AttendanceRow[]> {
    const rows = db.attendanceToday
      .map((a) => ({ ...a, employee: db.employees.find((e) => e.id === a.employeeId)! }))
      .filter((r) => r.employee && r.employee.status !== 'Inactive')
      .filter(
        (r) =>
          (!filters.branch || r.employee.branchId === filters.branch) &&
          (!filters.department || r.employee.departmentId === filters.department) &&
          (!filters.shift || r.employee.shift === filters.shift) &&
          (!filters.search ||
            r.employee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            r.employee.code.toLowerCase().includes(filters.search.toLowerCase())) &&
          (!filters.onlyUnmarked || r.status === 'Unmarked'),
      );
    return resolve(rows);
  },

  mark(employeeId: string, status: AttendanceMark): Promise<void> {
    const rec = db.attendanceToday.find((a) => a.employeeId === employeeId);
    if (rec) rec.status = status;
    return resolve(undefined);
  },

  markAllPresent(employeeIds: string[]): Promise<void> {
    db.attendanceToday.forEach((a) => {
      if (employeeIds.includes(a.employeeId)) a.status = 'Present';
    });
    return resolve(undefined);
  },
};

export const payrollApi = {
  list(filters: { search?: string; branch?: string; shift?: string; status?: string } = {}): Promise<Payslip[]> {
    const rows = db.payslips.filter((p) => {
      const emp = db.employees.find((e) => e.id === p.employeeId);
      return (
        (!filters.search ||
          p.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.employeeCode.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.branch || emp?.branchId === filters.branch) &&
        (!filters.shift || emp?.shift === filters.shift) &&
        (!filters.status || p.status === filters.status)
      );
    });
    return resolve(rows);
  },

  update(id: string, data: Partial<Payslip>): Promise<Payslip> {
    const idx = db.payslips.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Payslip not found');
    const updated = { ...db.payslips[idx]!, ...data };
    updated.netSalary =
      updated.base +
      updated.bonus -
      updated.deductions -
      updated.statutoryDeductions.reduce((s, x) => s + x.amount, 0) -
      updated.advances;
    db.payslips[idx] = updated;
    return resolve(updated);
  },

  disburse(id: string): Promise<Payslip> {
    return payrollApi.update(id, { status: 'Disbursed' });
  },

  disburseAll(): Promise<void> {
    db.payslips.forEach((p) => {
      if (p.status === 'Pending') p.status = 'Disbursed';
    });
    return resolve(undefined);
  },
};

export const leavesApi = {
  list(): Promise<Leave[]> {
    return resolve(db.leaves);
  },
  advances(): Promise<Advance[]> {
    return resolve(db.advances);
  },
  setStatus(id: string, status: Leave['status']): Promise<void> {
    const lv = db.leaves.find((l) => l.id === id);
    if (lv) lv.status = status;
    return resolve(undefined);
  },
};
