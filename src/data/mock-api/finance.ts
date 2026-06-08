import type {
  BankAccount,
  CashflowMonth,
  Cheque,
  Expense,
  FxRate,
  Paged,
  Transaction,
  Vendor,
} from '@/types';
import { db, nextId } from './db';
import { paginate, resolve, sortRows, textMatch, type ListParams } from './transport';

export interface Receivable {
  clientId: string;
  clientName: string;
  openingBalance: number;
  invoiced: number;
  withholding: number;
  received: number;
  outstanding: number;
}

export const financeApi = {
  banks(): Promise<BankAccount[]> {
    return resolve(db.bankAccounts);
  },
  addBank(data: Partial<BankAccount>): Promise<BankAccount> {
    const bank: BankAccount = {
      id: nextId('bank'),
      name: data.name ?? 'New Account',
      accountNumber: data.accountNumber ?? '',
      type: data.type ?? 'Current',
      owner: data.owner ?? db.company.name,
      balance: data.balance ?? 0,
      chequeBalance: 0,
      currency: data.currency ?? 'PKR',
      ...data,
    };
    db.bankAccounts.push(bank);
    return resolve(bank);
  },
  cheques(): Promise<Cheque[]> {
    return resolve(db.cheques);
  },
  transactions(bankId?: string): Promise<Transaction[]> {
    return resolve(bankId ? db.transactions.filter((t) => t.bankId === bankId) : db.transactions);
  },
  vendors(): Promise<Vendor[]> {
    return resolve(db.vendors);
  },
  receivables(): Promise<Receivable[]> {
    const rows = db.clients
      .map((c) => {
        const invs = db.invoices.filter((i) => i.clientId === c.id && i.status !== 'Draft' && i.status !== 'Cancelled');
        const invoiced = invs.reduce((s, i) => s + i.total, 0);
        const withholding = invs.reduce((s, i) => s + i.withholdingTax, 0);
        const received = invs.reduce((s, i) => s + i.received, 0);
        return {
          clientId: c.id,
          clientName: c.name,
          openingBalance: 0,
          invoiced,
          withholding,
          received,
          outstanding: invoiced - received,
        };
      })
      .filter((r) => r.invoiced > 0);
    return resolve(rows);
  },
  cashflow(): Promise<CashflowMonth[]> {
    return resolve(db.cashflow);
  },
  fx(): Promise<FxRate[]> {
    return resolve(db.fxRates);
  },
};

export interface ExpenseFilters extends ListParams {
  category?: string;
  client?: string;
  mode?: string;
}

export const expensesApi = {
  list(params: ExpenseFilters = {}): Promise<Paged<Expense>> {
    let rows = db.expenses.filter(
      (e) =>
        textMatch([e.description, e.category, e.vendor, e.clientName], params.search) &&
        (!params.category || e.category === params.category) &&
        (!params.client || e.clientId === params.client) &&
        (!params.mode || e.mode === params.mode),
    );
    rows = sortRows(rows, params, {
      date: (e) => e.date,
      amount: (e) => e.amount,
      category: (e) => e.category,
    });
    return resolve(paginate(rows, params));
  },
  categoryBreakdown(): Promise<Array<{ category: string; amount: number }>> {
    const map = new Map<string, number>();
    db.expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return resolve([...map.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount));
  },
  create(data: Partial<Expense>): Promise<Expense> {
    const exp: Expense = {
      id: nextId('exp'),
      date: data.date ?? new Date().toISOString().slice(0, 10),
      category: data.category ?? 'Other',
      description: data.description ?? '',
      amount: data.amount ?? 0,
      currency: data.currency ?? 'PKR',
      mode: data.mode ?? 'Cash',
      hasReceipt: data.hasReceipt ?? false,
      ...data,
    };
    db.expenses.unshift(exp);
    return resolve(exp);
  },
};
