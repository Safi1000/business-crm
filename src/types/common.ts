import type { CurrencyCode } from '@/lib/format';

export type { CurrencyCode };

export type ID = string;

/** ISO date string (yyyy-mm-dd) or full ISO datetime. */
export type ISODate = string;

export interface Branch {
  id: ID;
  name: string;
  city: string;
}

export interface Department {
  id: ID;
  name: string;
}

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface ActivityEvent {
  id: ID;
  type:
    | 'invoice'
    | 'payment'
    | 'client'
    | 'employee'
    | 'expense'
    | 'task'
    | 'payroll'
    | 'contract'
    | 'document';
  description: string;
  actor: string;
  at: ISODate;
  /** Route to the originating record. */
  href?: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'mention'
  | 'invoice_overdue'
  | 'date_approaching'
  | 'payroll_processed'
  | 'approval_requested';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  at: ISODate;
  read: boolean;
  mention?: boolean;
  href?: string;
}

/** Paged result shape returned by every list endpoint in the mock API. */
export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}
