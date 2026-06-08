import type { CurrencyCode, ID, ISODate } from './common';

export type BankAccountType = 'Current' | 'Savings' | 'Cash' | 'Treasury';

export interface BankAccount {
  id: ID;
  name: string;
  accountNumber: string;
  iban?: string;
  type: BankAccountType;
  owner: string;
  balance: number;
  chequeBalance: number;
  currency: CurrencyCode;
}

export type ChequeStatus = 'Pending' | 'Cleared' | 'Bounced' | 'In Transit';

export interface Cheque {
  id: ID;
  number: string;
  type: 'Incoming' | 'Outgoing';
  bankId: ID;
  bankName: string;
  date: ISODate;
  recipient: string;
  amount: number;
  currency: CurrencyCode;
  linkedTo?: string;
  status: ChequeStatus;
}

export interface Transaction {
  id: ID;
  date: ISODate;
  bankId: ID;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
  currency: CurrencyCode;
  reference?: string;
}

export type ExpenseMode = 'Cash' | 'Bank' | 'Card' | 'Cheque';

export interface Expense {
  id: ID;
  date: ISODate;
  category: string;
  clientId?: ID;
  clientName?: string;
  projectId?: ID;
  description: string;
  amount: number;
  currency: CurrencyCode;
  mode: ExpenseMode;
  vendor?: string;
  hasReceipt: boolean;
}

export interface Vendor {
  id: ID;
  name: string;
  openingBalance: number;
  billed: number;
  paid: number;
  currency: CurrencyCode;
}

export interface CashflowMonth {
  month: string; // e.g. "Jan"
  revenue: number;
  expenses: number;
  payroll: number;
}

export interface FxRate {
  id: ID;
  date: ISODate;
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number;
  source: 'auto' | 'manual';
}
