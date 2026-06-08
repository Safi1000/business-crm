/* Mutable in-memory store seeded from fixtures. Resource modules read/write here. */
import * as fx from '../fixtures';

export const db = {
  branches: [...fx.branches],
  departments: [...fx.departments],
  employees: [...fx.employees],
  clients: [...fx.clients],
  contracts: [...fx.contracts],
  invoices: [...fx.invoices],
  projects: [...fx.projects],
  tasks: [...fx.tasks],
  attendanceToday: [...fx.attendanceToday],
  payslips: [...fx.payslips],
  leaves: [...fx.leaves],
  advances: [...fx.advances],
  bankAccounts: [...fx.bankAccounts],
  cheques: [...fx.cheques],
  transactions: [...fx.transactions],
  vendors: [...fx.vendors],
  expenses: [...fx.expenses],
  importantDates: [...fx.importantDates],
  docFolders: [...fx.docFolders],
  docFiles: [...fx.docFiles],
  users: [...fx.users],
  notifications: [...fx.notifications],
  activity: [...fx.activity],
  cashflow: [...fx.cashflow],
  fxRates: [...fx.fxRates],
  items: [...fx.items],
  stockMovements: [...fx.stockMovements],
  quotes: [...fx.quotes],
  company: { ...fx.company },
};

let idCounter = 100000;
export const nextId = (prefix: string) => `${prefix}-${++idCounter}`;
