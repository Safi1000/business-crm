import type { ActivityEvent, BankAccount } from '@/types';
import { daysUntil } from '@/lib/format';
import { db } from './db';
import { resolve } from './transport';
import { attendanceTrend } from '../fixtures';

export interface DashboardAlert {
  id: string;
  message: string;
  tone: 'danger' | 'warning';
}

export interface DashboardData {
  kpis: {
    totalEmployees: number;
    employeeDelta: number;
    attendanceToday: number;
    attendanceDelta: number;
    expensesMtd: number;
    expensesDelta: number;
    payrollMtd: number;
    payrollStatus: 'Processed' | 'Pending';
  };
  banks: BankAccount[];
  totalCash: number;
  revenueByClient: Array<Record<string, string | number>>;
  attendanceTrend: Array<Record<string, string | number>>;
  activity: ActivityEvent[];
  alerts: DashboardAlert[];
}

export const dashboardApi = {
  get(): Promise<DashboardData> {
    const activeEmployees = db.employees.filter((e) => e.status !== 'Inactive');
    const present = db.attendanceToday.filter((a) => a.status === 'Present').length;
    const markable = db.attendanceToday.filter((a) => {
      const e = db.employees.find((x) => x.id === a.employeeId);
      return e && e.status !== 'Inactive';
    }).length;

    const thisMonth = '2026-06';
    const expensesMtd = db.expenses
      .filter((e) => e.date.startsWith(thisMonth))
      .reduce((s, e) => s + e.amount, 0);
    const payrollMtd = db.payslips.reduce((s, p) => s + p.netSalary, 0);
    const payrollDone = db.payslips.every((p) => p.status === 'Disbursed');

    // Revenue by client — top 8 by invoiced total, last 6 months bucketed.
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const topClients = [...db.clients]
      .map((c) => ({
        c,
        total: db.invoices.filter((i) => i.clientId === c.id).reduce((s, i) => s + i.total, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .filter((x) => x.total > 0);

    const revenueByClient = months.map((m, mi) => {
      const row: Record<string, string | number> = { month: m };
      topClients.forEach(({ c, total }) => {
        // distribute total across months deterministically
        row[c.name.split(' ')[0]!] = Math.round((total / 6) * (0.6 + ((mi * 7 + c.id.length) % 9) / 10));
      });
      return row;
    });

    const alerts: DashboardAlert[] = [];
    const overdue = db.invoices.filter((i) => i.status === 'Overdue');
    if (overdue.length) {
      alerts.push({
        id: 'a-overdue',
        message: `${overdue.length} invoice${overdue.length > 1 ? 's are' : ' is'} overdue — totalling ${Math.round(overdue.reduce((s, i) => s + (i.total - i.received), 0) / 1000)}K PKR.`,
        tone: 'danger',
      });
    }
    const expiringLicence = db.importantDates.find(
      (d) => d.category === 'Licence' && !d.completed && daysUntil(d.date) <= 14,
    );
    if (expiringLicence) {
      alerts.push({
        id: 'a-licence',
        message: `${expiringLicence.title} ${daysUntil(expiringLicence.date) < 0 ? 'has expired' : `expires in ${daysUntil(expiringLicence.date)} days`}.`,
        tone: 'warning',
      });
    }
    if (!payrollDone) {
      alerts.push({ id: 'a-payroll', message: 'June payroll has not been fully disbursed yet.', tone: 'warning' });
    }

    return resolve({
      kpis: {
        totalEmployees: activeEmployees.length,
        employeeDelta: 3,
        attendanceToday: markable ? Math.round((present / markable) * 100) : 0,
        attendanceDelta: 2,
        expensesMtd,
        expensesDelta: -8,
        payrollMtd,
        payrollStatus: payrollDone ? 'Processed' : 'Pending',
      },
      banks: db.bankAccounts,
      totalCash: db.bankAccounts.reduce((s, b) => s + b.balance, 0),
      revenueByClient,
      attendanceTrend: attendanceTrend as Array<Record<string, string | number>>,
      activity: db.activity,
      alerts,
    });
  },
};
