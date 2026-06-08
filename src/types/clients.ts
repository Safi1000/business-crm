import type { CurrencyCode, ID, ISODate } from './common';

export type ClientType = 'Business' | 'Individual';
export type ClientStatus = 'Active' | 'Inactive';

export interface Client {
  id: ID;
  code: string; // CLI-0001
  name: string;
  type: ClientType;
  industry: string;
  country: string;
  email: string;
  phone: string;
  status: ClientStatus;
  // Tax & compliance (country-pack driven)
  taxId?: string; // NTN / VAT
  strn?: string; // Pakistan only
  filerStatus?: 'Filer' | 'Non-Filer';
  withholdingRate?: number;
  // Billing
  currency: CurrencyCode;
  billingAddress?: string;
  shippingAddress?: string;
  paymentTermsDays: number;
  creditLimit?: number;
  defaultBranchId?: ID;
  additionalBranchIds?: ID[];
  // Derived / denormalized for list view
  outstanding: number;
  activeContracts: number;
  createdAt: ISODate;
}

export type ContractType = 'Service Agreement' | 'Retainer' | 'Project';
export type ContractStatus = 'Active' | 'Expired' | 'Cancelled';

export interface Contract {
  id: ID;
  code: string; // CON-0001
  clientId: ID;
  clientName: string;
  type: ContractType;
  startDate: ISODate;
  endDate: ISODate;
  value: number;
  currency: CurrencyCode;
  /** Monthly amount for retainers. */
  monthlyValue?: number;
  autoInvoice: boolean;
  status: ContractStatus;
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';

export interface Quote {
  id: ID;
  number: string; // QUO-0001
  clientId: ID;
  clientName: string;
  clientCode: string;
  issueDate: ISODate;
  expiryDate: ISODate;
  currency: CurrencyCode;
  status: QuoteStatus;
  total: number;
  convertedInvoiceId?: ID;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Cheque' | 'Bank Transfer';

export interface InvoiceLineItem {
  id: ID;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
}

export interface Payment {
  id: ID;
  date: ISODate;
  amount: number;
  method: PaymentMethod;
  reference: string;
  bank?: string;
  recordedBy: string;
  voided?: boolean;
}

export interface Invoice {
  id: ID;
  number: string; // INV-0001
  clientId: ID;
  clientName: string;
  clientCode: string;
  projectId?: ID;
  issueDate: ISODate;
  dueDate: ISODate;
  currency: CurrencyCode;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  notes?: string;
  terms?: string;
  withholdingTax: number;
  hasAttachment: boolean;
  payments: Payment[];
  // Derived
  subtotal: number;
  tax: number;
  total: number;
  received: number;
}
