import type {
  ActivityEvent,
  Advance,
  AppNotification,
  AppUser,
  AttendanceRecord,
  Item,
  StockMovement,
  Quote,
  BankAccount,
  Branch,
  CashflowMonth,
  Cheque,
  Client,
  CompanyProfile,
  Contract,
  DateCategory,
  Department,
  DocFile,
  DocFolder,
  Employee,
  Expense,
  FxRate,
  ImportantDate,
  Invoice,
  Leave,
  Payslip,
  Project,
  Task,
  Transaction,
  Vendor,
} from '@/types';
import { chance, int, isoDateTimeOffset, isoOffset, pad, pick, rand, resetSeed } from './seed';

resetSeed(20260608);

/* ---------------- Reference data ---------------- */

export const branches: Branch[] = [
  { id: 'br-khi', name: 'Karachi HQ', city: 'Karachi' },
  { id: 'br-lhr', name: 'Lahore', city: 'Lahore' },
  { id: 'br-isb', name: 'Islamabad', city: 'Islamabad' },
];

export const departments: Department[] = [
  { id: 'dp-eng', name: 'Engineering' },
  { id: 'dp-design', name: 'Design' },
  { id: 'dp-sales', name: 'Sales' },
  { id: 'dp-fin', name: 'Finance' },
  { id: 'dp-hr', name: 'Human Resources' },
  { id: 'dp-ops', name: 'Operations' },
];

const FIRST = [
  'Ahmed', 'Sara', 'Bilal', 'Ayesha', 'Usman', 'Fatima', 'Hassan', 'Zainab', 'Imran', 'Hira',
  'Faisal', 'Maria', 'Omar', 'Nida', 'Kamran', 'Sana', 'Tariq', 'Mehwish', 'Asad', 'Rabia',
  'Junaid', 'Komal', 'Saad', 'Iqra',
];
const LAST = [
  'Khan', 'Malik', 'Sheikh', 'Raza', 'Hussain', 'Iqbal', 'Butt', 'Qureshi', 'Siddiqui', 'Ansari',
  'Mirza', 'Chaudhry', 'Awan', 'Baig', 'Rashid', 'Farooqi',
];
const COMPANIES = [
  'Indus Textiles', 'Meezan Foods', 'Orient Pharma', 'Pak Logistics', 'Crescent Steel',
  'Falcon Tech', 'Sapphire Retail', 'Bahria Developers', 'Nimir Chemicals', 'Shifa Health',
  'Engro Connect', 'Systems Edge', 'Kohinoor Mills', 'AlKaramStudio', 'Daraz Mart',
  'Habib Motors', 'Treet Consumer', 'Lucky Cement Co',
];
const INDUSTRIES = ['Manufacturing', 'Retail', 'Healthcare', 'Logistics', 'Technology', 'Real Estate', 'FMCG'];
const EXPENSE_CATS = ['Office Rent', 'Utilities', 'Salaries Sub', 'Marketing', 'Travel', 'Software', 'Equipment', 'Maintenance'];

const fullName = () => `${pick(FIRST)} ${pick(LAST)}`;

/* ---------------- Employees ---------------- */

export const employees: Employee[] = Array.from({ length: 24 }, (_, i) => {
  const dept = pick(departments);
  const branch = pick(branches);
  const name = fullName();
  const status = chance(0.1) ? 'On Leave' : chance(0.08) ? 'Inactive' : 'Active';
  const docsRequired = 5;
  const docsCount = chance(0.25) ? int(2, 4) : 5;
  const base = int(60, 450) * 1000;
  return {
    id: `emp-${i + 1}`,
    code: `EMP-${pad(i + 1)}`,
    name,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@techxserve.co`,
    phone: `+92 3${int(0, 4)}${int(10, 99)} ${int(1000000, 9999999)}`,
    country: 'Pakistan',
    type: pick(['Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract', 'Intern'] as const),
    departmentId: dept.id,
    department: dept.name,
    branchId: branch.id,
    branch: branch.name,
    reportingTo: chance(0.7) ? fullName() : undefined,
    joinDate: isoOffset(-int(60, 1500)),
    shift: pick(['Morning', 'Morning', 'Evening', 'Night'] as const),
    status: status as Employee['status'],
    baseSalary: base,
    currency: 'PKR',
    bankName: pick(['Meezan Bank', 'HBL', 'UBL', 'Bank Alfalah', 'Allied Bank']),
    iban: `PK${int(10, 99)}MEZN${int(1000, 9999)}${int(10000000, 99999999)}`,
    cnic: `${int(10000, 99999)}-${int(1000000, 9999999)}-${int(1, 9)}`,
    eobiNo: `EOBI-${int(100000, 999999)}`,
    docsComplete: docsCount === docsRequired,
    docsCount,
    docsRequired,
  } satisfies Employee;
});

/* ---------------- Clients ---------------- */

export const clients: Client[] = COMPANIES.map((name, i) => {
  const type = chance(0.85) ? 'Business' : 'Individual';
  const outstanding = chance(0.5) ? int(0, 25) * 50000 : 0;
  return {
    id: `cli-${i + 1}`,
    code: `CLI-${pad(i + 1)}`,
    name,
    type: type as Client['type'],
    industry: pick(INDUSTRIES),
    country: 'Pakistan',
    email: `accounts@${name.toLowerCase().replace(/[^a-z]/g, '')}.com.pk`,
    phone: `+92 21 ${int(30000000, 39999999)}`,
    status: chance(0.12) ? 'Inactive' : 'Active',
    taxId: `${int(1000000, 9999999)}-${int(1, 9)}`,
    strn: `32-77-${int(1000, 9999)}-${int(100, 999)}-${int(10, 99)}`,
    filerStatus: chance(0.7) ? 'Filer' : 'Non-Filer',
    withholdingRate: pick([0, 1, 4, 4, 8]),
    currency: 'PKR',
    billingAddress: `${int(1, 200)}-${pick(['A', 'B', 'C'])}, ${pick(['Gulshan', 'DHA', 'Clifton', 'Gulberg', 'F-7'])}, ${pick(branches).city}`,
    paymentTermsDays: pick([15, 30, 30, 45, 60]),
    creditLimit: int(5, 50) * 100000,
    defaultBranchId: pick(branches).id,
    outstanding,
    activeContracts: int(0, 3),
    createdAt: isoOffset(-int(30, 900)),
  } satisfies Client;
});

const activeClients = clients.filter((c) => c.status === 'Active');

/* ---------------- Contracts ---------------- */

export const contracts: Contract[] = Array.from({ length: 14 }, (_, i) => {
  const client = pick(activeClients);
  const type = pick(['Service Agreement', 'Retainer', 'Project'] as const);
  const start = -int(30, 600);
  const end = start + pick([180, 365, 365, 730]);
  const value = int(3, 40) * 100000;
  const expired = end < 0;
  return {
    id: `con-${i + 1}`,
    code: `CON-${pad(i + 1)}`,
    clientId: client.id,
    clientName: client.name,
    type,
    startDate: isoOffset(start),
    endDate: isoOffset(end),
    value,
    currency: 'PKR',
    monthlyValue: type === 'Retainer' ? Math.round(value / 12) : undefined,
    autoInvoice: type === 'Retainer' ? chance(0.7) : false,
    status: expired ? 'Expired' : chance(0.1) ? 'Cancelled' : 'Active',
  } satisfies Contract;
});

/* ---------------- Invoices ---------------- */

const STAFF = ['Faisal Malik', 'Nida Sheikh', 'Omar Raza'];

export const invoices: Invoice[] = Array.from({ length: 32 }, (_, i) => {
  const client = pick(activeClients);
  const issue = -int(0, 150);
  const due = issue + client.paymentTermsDays;
  const lineCount = int(1, 4);
  const lineItems = Array.from({ length: lineCount }, (_, j) => ({
    id: `inv-${i + 1}-li-${j + 1}`,
    description: pick(['Consulting services', 'Software development', 'Monthly retainer', 'UI/UX design', 'Cloud hosting', 'Support & maintenance']),
    quantity: int(1, 10),
    rate: int(5, 80) * 1000,
    taxRate: pick([0, 0, 16, 17]),
  }));
  const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.rate, 0);
  const tax = lineItems.reduce((s, li) => s + (li.quantity * li.rate * li.taxRate) / 100, 0);
  const withholdingTax = Math.round((subtotal * (client.withholdingRate ?? 0)) / 100);
  const total = subtotal + tax - withholdingTax;

  // status & payments
  const roll = rand();
  let status: Invoice['status'];
  let received = 0;
  const payments: Invoice['payments'] = [];
  if (roll < 0.12) status = 'Draft';
  else if (roll < 0.25) status = 'Sent';
  else if (roll < 0.6) {
    status = 'Paid';
    received = total;
  } else if (roll < 0.75) {
    status = 'Partial';
    received = Math.round(total * 0.5);
  } else if (due < 0) status = 'Overdue';
  else status = 'Sent';

  if (received > 0) {
    payments.push({
      id: `pay-${i + 1}-1`,
      date: isoOffset(issue + int(3, 20)),
      amount: received,
      method: pick(['Bank Transfer', 'Cheque', 'Cash'] as const),
      reference: `TXN-${int(100000, 999999)}`,
      bank: pick(['Meezan Bank', 'HBL', 'UBL']),
      recordedBy: pick(STAFF),
    });
  }

  return {
    id: `inv-${i + 1}`,
    number: `INV-${pad(i + 1)}`,
    clientId: client.id,
    clientName: client.name,
    clientCode: client.code,
    issueDate: isoOffset(issue),
    dueDate: isoOffset(due),
    currency: 'PKR',
    status,
    lineItems,
    notes: chance(0.4) ? 'Thank you for your business.' : undefined,
    terms: 'Payment due within terms. Late payments subject to 2% monthly surcharge.',
    withholdingTax,
    hasAttachment: chance(0.35),
    payments,
    subtotal,
    tax,
    total,
    received,
  } satisfies Invoice;
});

/* ---------------- Quotes / Proposals (P2) ---------------- */

export const quotes: Quote[] = Array.from({ length: 14 }, (_, i) => {
  const client = pick(activeClients);
  const issue = -int(0, 90);
  const total = int(5, 60) * 10000;
  const roll = rand();
  const status: Quote['status'] = roll < 0.2 ? 'Draft' : roll < 0.45 ? 'Sent' : roll < 0.7 ? 'Accepted' : roll < 0.85 ? 'Declined' : 'Expired';
  return {
    id: `quo-${i + 1}`,
    number: `QUO-${pad(i + 1)}`,
    clientId: client.id,
    clientName: client.name,
    clientCode: client.code,
    issueDate: isoOffset(issue),
    expiryDate: isoOffset(issue + 30),
    currency: 'PKR',
    status,
    total,
    convertedInvoiceId: status === 'Accepted' && chance(0.5) ? `inv-${int(1, 20)}` : undefined,
  } satisfies Quote;
});

/* ---------------- Projects & Tasks ---------------- */

export const projects: Project[] = Array.from({ length: 10 }, (_, i) => {
  const client = pick(activeClients);
  const budget = chance(0.85) ? int(5, 60) * 100000 : null;
  const spent = budget ? Math.round(budget * (0.2 + rand() * 1.1)) : int(2, 20) * 100000;
  return {
    id: `prj-${i + 1}`,
    code: `PRJ-${pad(i + 1)}`,
    name: `${pick(['Website Revamp', 'ERP Rollout', 'Mobile App', 'Brand Identity', 'Cloud Migration', 'Data Pipeline', 'POS System', 'Marketing Site'])} — ${client.name.split(' ')[0]}`,
    clientId: client.id,
    clientName: client.name,
    managerName: pick(STAFF),
    status: pick(['Lead', 'Active', 'Active', 'Active', 'On Hold', 'Completed'] as const),
    billingModel: pick(['Fixed', 'T&M', 'Retainer'] as const),
    budget,
    spent,
    currency: 'PKR',
    startDate: isoOffset(-int(20, 200)),
    endDate: isoOffset(int(-30, 180)),
  } satisfies Project;
});

const TASK_TITLES = [
  'Finalize Q3 invoice batch', 'Review payroll for June', 'Onboard new client account',
  'Fix attendance sync bug', 'Prepare partnership report', 'Update tax filing documents',
  'Design dashboard mockups', 'Reconcile bank statement', 'Follow up on overdue invoice',
  'Renew office insurance', 'Migrate database to cloud', 'Draft service agreement',
  'Audit expense receipts', 'Schedule team 1:1s', 'Configure FX rate provider',
];
const LABELS = ['finance', 'urgent', 'design', 'backend', 'client', 'admin', 'bug'];

export const tasks: Task[] = Array.from({ length: 28 }, (_, i) => {
  const standalone = chance(0.3);
  const project = standalone ? null : pick(projects);
  const assignees = Array.from({ length: int(1, 3) }, () => pick(employees).name);
  return {
    id: `task-${i + 1}`,
    title: pick(TASK_TITLES),
    description: chance(0.6) ? 'Coordinate with the relevant team and update the tracker once done.' : undefined,
    projectId: project?.id ?? null,
    projectName: project?.name ?? null,
    assignees: [...new Set(assignees)],
    priority: pick(['Low', 'Medium', 'Medium', 'High', 'Urgent'] as const),
    status: pick(['Backlog', 'To Do', 'To Do', 'In Progress', 'In Progress', 'Review', 'Done'] as const),
    dueDate: chance(0.85) ? isoOffset(int(-10, 30)) : null,
    labels: [...new Set(Array.from({ length: int(0, 2) }, () => pick(LABELS)))],
    checklist: Array.from({ length: int(0, 4) }, (_, j) => ({
      id: `task-${i + 1}-c${j}`,
      text: pick(['Gather inputs', 'Draft version', 'Internal review', 'Send for approval']),
      done: chance(0.4),
    })),
    comments: Array.from({ length: int(0, 3) }, (_, j) => ({
      id: `task-${i + 1}-cm${j}`,
      author: pick(employees).name,
      body: pick(['On it.', 'Can you clarify the scope?', 'Done, please review.', 'Blocked on finance sign-off.']),
      at: isoDateTimeOffset(-int(1, 200)),
    })),
    hoursLogged: int(0, 40),
    createdBy: pick(STAFF),
    createdAt: isoOffset(-int(1, 60)),
  } satisfies Task;
});

/* ---------------- Attendance ---------------- */

export const attendanceToday: AttendanceRecord[] = employees.map((e) => {
  if (e.status === 'Inactive') return { employeeId: e.id, date: isoOffset(0), status: 'Unmarked' as const };
  const r = rand();
  const status = e.status === 'On Leave' ? 'Leave' : r < 0.78 ? 'Present' : r < 0.88 ? 'Absent' : r < 0.94 ? 'Leave' : 'Unmarked';
  return { employeeId: e.id, date: isoOffset(0), status: status as AttendanceRecord['status'] };
});

/** 7-day present/absent/leave trend for the dashboard line chart. */
export const attendanceTrend = Array.from({ length: 7 }, (_, i) => {
  const day = -6 + i;
  const present = int(16, 22);
  const absent = int(0, 4);
  const leave = int(0, 3);
  return { day: isoOffset(day).slice(5), Present: present, Absent: absent, Leave: leave };
});

/* ---------------- Payroll ---------------- */

export const payslips: Payslip[] = employees
  .filter((e) => e.status !== 'Inactive')
  .map((e, i) => {
    const present = int(18, 24);
    const absent = int(0, 3);
    const leave = int(0, 2);
    const perDay = Math.round(e.baseSalary / 26);
    const effectivePaidDays = present + leave;
    const bonus = chance(0.3) ? int(5, 30) * 1000 : 0;
    const deductions = absent * perDay;
    const statutory = [
      { label: 'EOBI', amount: 370 },
      { label: 'Income Tax', amount: Math.round(e.baseSalary * 0.05) },
    ];
    const advances = chance(0.25) ? int(10, 50) * 1000 : 0;
    const statSum = statutory.reduce((s, x) => s + x.amount, 0);
    const net = e.baseSalary + bonus - deductions - statSum - advances;
    return {
      id: `ps-${i + 1}`,
      employeeId: e.id,
      employeeName: e.name,
      employeeCode: e.code,
      month: '2026-06',
      presentDays: present,
      absentDays: absent,
      leaveDays: leave,
      allowedLeaves: 2,
      effectivePaidDays,
      base: e.baseSalary,
      bonus,
      deductions,
      statutoryDeductions: statutory,
      advances,
      netSalary: net,
      currency: 'PKR',
      status: chance(0.55) ? 'Disbursed' : 'Pending',
      paymentMode: pick(['Bank Transfer', 'Cash', 'Cheque'] as const),
    } satisfies Payslip;
  });

/* ---------------- Leaves & Advances ---------------- */

export const leaves: Leave[] = Array.from({ length: 16 }, (_, i) => {
  const e = pick(employees);
  const from = int(-20, 25);
  const days = int(1, 5);
  return {
    id: `lv-${i + 1}`,
    employeeId: e.id,
    employeeName: e.name,
    appliedOn: isoOffset(from - int(2, 10)),
    type: pick(['Annual', 'Sick', 'Casual', 'Unpaid'] as const),
    from: isoOffset(from),
    to: isoOffset(from + days - 1),
    days,
    reason: pick(['Family event', 'Medical', 'Personal work', 'Travel', 'Rest']),
    status: pick(['Pending', 'Approved', 'Approved', 'Rejected'] as const),
    approver: pick(STAFF),
  } satisfies Leave;
});

export const advances: Advance[] = Array.from({ length: 10 }, (_, i) => {
  const e = pick(employees);
  return {
    id: `adv-${i + 1}`,
    employeeId: e.id,
    employeeName: e.name,
    date: isoOffset(-int(1, 60)),
    amount: int(10, 80) * 1000,
    currency: 'PKR',
    reason: pick(['Medical emergency', 'Advance against salary', 'Travel advance', 'Education']),
    status: pick(['Pending', 'Approved', 'Settled'] as const),
  } satisfies Advance;
});

/* ---------------- Finance: banks, cheques, txns, expenses, vendors ---------------- */

export const bankAccounts: BankAccount[] = [
  { id: 'bank-1', name: 'Meezan Bank — Current', accountNumber: '0102-79451-001', iban: 'PK36MEZN0001027945101', type: 'Current', owner: 'TechxServe (Pvt) Ltd', balance: 4850000, chequeBalance: 320000, currency: 'PKR' },
  { id: 'bank-2', name: 'HBL — Operations', accountNumber: '1234-56789-002', iban: 'PK24HABB0012345678902', type: 'Current', owner: 'TechxServe (Pvt) Ltd', balance: 2310000, chequeBalance: 150000, currency: 'PKR' },
  { id: 'bank-3', name: 'UBL — Payroll', accountNumber: '5566-77889-003', iban: 'PK11UBL00055667788903', type: 'Savings', owner: 'TechxServe (Pvt) Ltd', balance: 1675000, chequeBalance: 0, currency: 'PKR' },
  { id: 'bank-cash', name: 'Cash in Hand (Treasury)', accountNumber: '—', type: 'Treasury', owner: 'Finance Dept', balance: 285000, chequeBalance: 0, currency: 'PKR' },
];

export const cheques: Cheque[] = Array.from({ length: 9 }, (_, i) => {
  const bank = pick(bankAccounts.filter((b) => b.type !== 'Treasury'));
  const type = chance(0.5) ? 'Incoming' : 'Outgoing';
  return {
    id: `chq-${i + 1}`,
    number: `${int(100000, 999999)}`,
    type: type as Cheque['type'],
    bankId: bank.id,
    bankName: bank.name,
    date: isoOffset(int(-20, 20)),
    recipient: type === 'Incoming' ? pick(activeClients).name : pick(COMPANIES),
    amount: int(1, 15) * 50000,
    currency: 'PKR',
    linkedTo: chance(0.5) ? `INV-${pad(int(1, 32))}` : undefined,
    status: pick(['Pending', 'Cleared', 'In Transit', 'Bounced'] as const),
  } satisfies Cheque;
});

export const transactions: Transaction[] = Array.from({ length: 40 }, (_, i) => {
  const bank = pick(bankAccounts);
  const type = chance(0.5) ? 'Credit' : 'Debit';
  return {
    id: `txn-${i + 1}`,
    date: isoOffset(-int(0, 90)),
    bankId: bank.id,
    description: type === 'Credit' ? `Payment received — ${pick(activeClients).name}` : `Payment — ${pick(EXPENSE_CATS)}`,
    type: type as Transaction['type'],
    amount: int(1, 20) * 25000,
    currency: 'PKR',
    reference: `REF-${int(10000, 99999)}`,
  } satisfies Transaction;
});

export const vendors: Vendor[] = Array.from({ length: 8 }, (_, i) => {
  const billed = int(2, 30) * 50000;
  const paid = Math.round(billed * (0.3 + rand() * 0.7));
  return {
    id: `ven-${i + 1}`,
    name: pick(['Office Mart', 'TechSupply Co', 'PrintWorks', 'CloudHost Pk', 'Fuel Station', 'Stationery Hub', 'AC Services', 'Security Guards Ltd']),
    openingBalance: int(0, 5) * 50000,
    billed,
    paid,
    currency: 'PKR',
  } satisfies Vendor;
});

export const expenses: Expense[] = Array.from({ length: 36 }, (_, i) => {
  const cat = pick(EXPENSE_CATS);
  const withClient = chance(0.4);
  const client = withClient ? pick(activeClients) : undefined;
  return {
    id: `exp-${i + 1}`,
    date: isoOffset(-int(0, 120)),
    category: cat,
    clientId: client?.id,
    clientName: client?.name,
    description: `${cat} — ${pick(['monthly', 'quarterly', 'one-time', 'recurring'])}`,
    amount: int(5, 80) * 5000,
    currency: 'PKR',
    mode: pick(['Cash', 'Bank', 'Card', 'Cheque'] as const),
    vendor: chance(0.6) ? pick(vendors).name : undefined,
    hasReceipt: chance(0.7),
  } satisfies Expense;
});

/* ---------------- Cashflow (12 months) ---------------- */

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
export const cashflow: CashflowMonth[] = MONTHS.map((m) => ({
  month: m,
  revenue: int(25, 55) * 100000,
  expenses: int(8, 22) * 100000,
  payroll: int(15, 25) * 100000,
}));

/* ---------------- FX ---------------- */

export const fxRates: FxRate[] = [
  { id: 'fx-1', date: isoOffset(0), base: 'PKR', quote: 'USD', rate: 0.0036, source: 'auto' },
  { id: 'fx-2', date: isoOffset(0), base: 'PKR', quote: 'EUR', rate: 0.0033, source: 'auto' },
  { id: 'fx-3', date: isoOffset(0), base: 'PKR', quote: 'GBP', rate: 0.0028, source: 'manual' },
  { id: 'fx-4', date: isoOffset(0), base: 'PKR', quote: 'AED', rate: 0.013, source: 'auto' },
];

/* ---------------- Compliance ---------------- */

const DATE_DEFS: Array<{ title: string; category: DateCategory; offset: number; priority: ImportantDate['priority'] }> = [
  { title: 'Sales Tax Return Filing', category: 'Tax', offset: 4, priority: 'Critical' },
  { title: 'Trade Licence Renewal', category: 'Licence', offset: 12, priority: 'High' },
  { title: 'Office Fire Insurance', category: 'Insurance', offset: 21, priority: 'Medium' },
  { title: 'Annual Income Tax Return', category: 'Tax', offset: 45, priority: 'High' },
  { title: 'PSEB Registration Renewal', category: 'Licence', offset: -3, priority: 'Critical' },
  { title: 'Retainer Contract — Indus Textiles', category: 'Contract', offset: 30, priority: 'Medium' },
  { title: 'Vehicle Token Tax', category: 'Other', offset: 60, priority: 'Low' },
  { title: 'EOBI Contribution Deadline', category: 'Tax', offset: 8, priority: 'High' },
  { title: 'Health Insurance Group Policy', category: 'Insurance', offset: 90, priority: 'Medium' },
];

export const importantDates: ImportantDate[] = DATE_DEFS.map((d, i) => ({
  id: `date-${i + 1}`,
  title: d.title,
  date: isoOffset(d.offset),
  category: d.category,
  advanceNoticeDays: pick([7, 14, 30]),
  priority: d.priority,
  completed: chance(0.15),
  recurring: chance(0.3),
}));

/* ---------------- Documents ---------------- */

export const docFolders: DocFolder[] = [
  { id: 'fld-company', name: 'Company Docs', parentId: null, count: 6 },
  { id: 'fld-hr', name: 'HR Policies', parentId: null, count: 4 },
  { id: 'fld-contracts', name: 'Client Contracts', parentId: null, count: 8 },
  { id: 'fld-vendor', name: 'Vendor Agreements', parentId: null, count: 3 },
  { id: 'fld-tax', name: 'Tax & Compliance', parentId: null, count: 5 },
];

export const docFiles: DocFile[] = docFolders.flatMap((f) =>
  Array.from({ length: f.count }, (_, i) => ({
    id: `${f.id}-file-${i + 1}`,
    folderId: f.id,
    name: `${f.name.split(' ')[0]} ${pick(['Agreement', 'Policy', 'Certificate', 'Report', 'Statement', 'Form'])} ${2025 + int(0, 1)}.${pick(['pdf', 'docx', 'xlsx'])}`,
    type: pick(['pdf', 'pdf', 'doc', 'sheet', 'image'] as const),
    sizeKb: int(80, 4200),
    uploadedBy: pick(STAFF),
    uploadedAt: isoOffset(-int(5, 300)),
  })),
);

/* ---------------- Inventory ---------------- */

const LOCATIONS = ['Karachi Warehouse', 'Lahore Store', 'Islamabad Store'];
const ITEM_DEFS = [
  ['Laptop — Dell Latitude', 'Electronics', 'unit'], ['Wireless Mouse', 'Accessories', 'unit'],
  ['A4 Paper Ream', 'Stationery', 'ream'], ['Toner Cartridge', 'Consumables', 'unit'],
  ['Office Chair', 'Furniture', 'unit'], ['USB-C Cable', 'Accessories', 'unit'],
  ['Monitor 24"', 'Electronics', 'unit'], ['Desk Lamp', 'Furniture', 'unit'],
  ['Whiteboard Marker', 'Stationery', 'box'], ['Network Switch', 'Electronics', 'unit'],
  ['HDMI Cable', 'Accessories', 'unit'], ['Printer — HP', 'Electronics', 'unit'],
];

export const items: Item[] = ITEM_DEFS.map(([name, category, unit], i) => {
  const stock = int(0, 120);
  const reorder = int(10, 30);
  const cost = int(2, 60) * 1000;
  const locs = LOCATIONS.slice(0, int(1, 3)).map((location) => ({ location, qty: 0 }));
  let remaining = stock;
  locs.forEach((l, idx) => { l.qty = idx === locs.length - 1 ? remaining : int(0, remaining); remaining -= l.qty; });
  return {
    id: `item-${i + 1}`,
    sku: `SKU-${pad(1000 + i, 4)}`,
    name: name!,
    category: category!,
    unit: unit!,
    stock,
    reorderLevel: reorder,
    costPrice: cost,
    salePrice: Math.round(cost * (1.2 + rand() * 0.5)),
    locations: locs,
  } satisfies Item;
});

export const stockMovements: StockMovement[] = Array.from({ length: 30 }, (_, i) => {
  const item = pick(items);
  const type = pick(['In', 'Out', 'Out', 'Adjustment', 'Stocktake'] as const);
  const qty = type === 'Out' ? -int(1, 20) : int(1, 30);
  return {
    id: `mov-${i + 1}`,
    date: isoOffset(-int(0, 60)),
    type,
    itemId: item.id,
    sku: item.sku,
    itemName: item.name,
    quantity: qty,
    fromLocation: type === 'Out' || type === 'Adjustment' ? pick(LOCATIONS) : undefined,
    toLocation: type === 'In' ? pick(LOCATIONS) : undefined,
    reference: chance(0.5) ? `PO-${int(1000, 9999)}` : undefined,
    user: pick(STAFF),
  } satisfies StockMovement;
});

/* ---------------- Admin ---------------- */

export const users: AppUser[] = [
  { id: 'usr-1', name: 'Faisal Malik', email: 'faisal@techxserve.co', title: 'Founder & CEO', permissions: [], role: 'Super Admin' },
  { id: 'usr-2', name: 'Nida Sheikh', email: 'nida@techxserve.co', title: 'Finance Manager', permissions: ['Finance', 'Invoices', 'Expenses', 'Reports'], role: 'Finance' },
  { id: 'usr-3', name: 'Omar Raza', email: 'omar@techxserve.co', title: 'HR Lead', permissions: ['Workforce', 'Payroll', 'Attendance'], role: 'HR' },
  { id: 'usr-4', name: 'Sara Khan', email: 'sara@techxserve.co', title: 'Operations Manager', permissions: ['Projects', 'Tasks', 'Clients'], role: 'Ops' },
  { id: 'usr-5', name: 'Bilal Iqbal', email: 'bilal@techxserve.co', title: 'Sales Manager', permissions: ['Clients', 'Contracts', 'Invoices'], role: 'Manager' },
];

export const company: CompanyProfile = {
  name: 'TechxServe (Pvt) Ltd',
  legalAddress: 'Plot 27-C, Khayaban-e-Ittehad, DHA Phase VII, Karachi, Pakistan',
  taxId: '4567891-2',
  presentationCurrency: 'PKR',
  fiscalYearStart: 'July',
};

/* ---------------- Activity & Notifications ---------------- */

export const activity: ActivityEvent[] = Array.from({ length: 12 }, (_, i) => {
  const kinds: ActivityEvent['type'][] = ['invoice', 'payment', 'client', 'employee', 'expense', 'task', 'payroll'];
  const type = kinds[i % kinds.length]!;
  const map: Record<string, string> = {
    invoice: `Invoice INV-${pad(int(1, 32))} issued to ${pick(activeClients).name}`,
    payment: `Payment of PKR ${int(50, 500)}K received from ${pick(activeClients).name}`,
    client: `New client ${pick(COMPANIES)} added`,
    employee: `${fullName()} marked attendance`,
    expense: `Expense recorded — ${pick(EXPENSE_CATS)}`,
    task: `Task "${pick(TASK_TITLES)}" completed`,
    payroll: `June payroll processed for ${int(18, 24)} employees`,
  };
  return {
    id: `act-${i + 1}`,
    type,
    description: map[type]!,
    actor: pick(STAFF),
    at: isoDateTimeOffset(-int(1, 72)),
  } satisfies ActivityEvent;
});

export const notifications: AppNotification[] = [
  { id: 'n-1', type: 'invoice_overdue', title: 'Invoice overdue', body: 'INV-0007 to Crescent Steel is 12 days overdue.', at: isoDateTimeOffset(-3), read: false, href: '/invoices' },
  { id: 'n-2', type: 'task_assigned', title: 'Task assigned to you', body: 'Review payroll for June', at: isoDateTimeOffset(-6), read: false, href: '/tasks' },
  { id: 'n-3', type: 'mention', title: 'Sara Khan mentioned you', body: '@you can you confirm the scope on ERP Rollout?', at: isoDateTimeOffset(-9), read: false, mention: true, href: '/tasks' },
  { id: 'n-4', type: 'date_approaching', title: 'Deadline approaching', body: 'Sales Tax Return Filing due in 4 days.', at: isoDateTimeOffset(-20), read: true, href: '/compliance/dates' },
  { id: 'n-5', type: 'payroll_processed', title: 'Payroll processed', body: 'June payroll has been disbursed to 14 employees.', at: isoDateTimeOffset(-28), read: true, href: '/workforce/payroll' },
  { id: 'n-6', type: 'approval_requested', title: 'Leave approval requested', body: 'Ayesha Malik requested 3 days annual leave.', at: isoDateTimeOffset(-40), read: true, mention: false, href: '/workforce/leaves' },
];
