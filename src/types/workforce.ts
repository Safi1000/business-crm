import type { CurrencyCode, ID, ISODate } from './common';

export type EmployeeType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Employee {
  id: ID;
  code: string; // EMP-0001
  name: string;
  email: string;
  phone: string;
  dob?: ISODate;
  country: string;
  address?: string;
  emergencyContact?: { name: string; relation: string; phone: string };
  type: EmployeeType;
  departmentId: ID;
  department: string;
  branchId: ID;
  branch: string;
  reportingTo?: string;
  joinDate: ISODate;
  shift: 'Morning' | 'Evening' | 'Night';
  status: EmployeeStatus;
  // Compensation
  baseSalary: number;
  currency: CurrencyCode;
  bankName?: string;
  iban?: string;
  // Statutory (Pakistan country pack)
  cnic?: string;
  eobiNo?: string;
  // Documents
  docsComplete: boolean;
  docsCount: number;
  docsRequired: number;
  photoUrl?: string;
}

export type AttendanceMark = 'Present' | 'Absent' | 'Leave' | 'Unmarked';

export interface AttendanceRecord {
  employeeId: ID;
  date: ISODate;
  status: AttendanceMark;
}

export type PayslipStatus = 'Pending' | 'Disbursed';

export interface StatutoryDeduction {
  label: string;
  amount: number;
}

export interface Payslip {
  id: ID;
  employeeId: ID;
  employeeName: string;
  employeeCode: string;
  month: string; // yyyy-mm
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  allowedLeaves: number;
  effectivePaidDays: number;
  base: number;
  bonus: number;
  deductions: number;
  statutoryDeductions: StatutoryDeduction[];
  advances: number;
  netSalary: number;
  currency: CurrencyCode;
  status: PayslipStatus;
  paymentMode?: 'Cash' | 'Cheque' | 'Bank Transfer';
}

export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Leave {
  id: ID;
  employeeId: ID;
  employeeName: string;
  appliedOn: ISODate;
  type: LeaveType;
  from: ISODate;
  to: ISODate;
  days: number;
  reason: string;
  status: LeaveStatus;
  approver: string;
}

export interface Advance {
  id: ID;
  employeeId: ID;
  employeeName: string;
  date: ISODate;
  amount: number;
  currency: CurrencyCode;
  reason: string;
  status: 'Pending' | 'Approved' | 'Settled';
}
