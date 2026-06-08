import type { Invoice, Paged, Payment } from '@/types';
import { daysUntil } from '@/lib/format';
import { db, nextId } from './db';
import { paginate, resolve, sortRows, textMatch, type ListParams } from './transport';

export interface InvoiceFilters extends ListParams {
  status?: string;
  client?: string;
}

function recompute(inv: Invoice): Invoice {
  const subtotal = inv.lineItems.reduce((s, li) => s + li.quantity * li.rate, 0);
  const tax = inv.lineItems.reduce((s, li) => s + (li.quantity * li.rate * li.taxRate) / 100, 0);
  const total = subtotal + tax - inv.withholdingTax;
  const received = inv.payments.filter((p) => !p.voided).reduce((s, p) => s + p.amount, 0);
  let status = inv.status;
  if (status !== 'Draft' && status !== 'Cancelled') {
    if (received >= total && total > 0) status = 'Paid';
    else if (received > 0) status = 'Partial';
    else if (daysUntil(inv.dueDate) < 0) status = 'Overdue';
    else status = 'Sent';
  }
  return { ...inv, subtotal, tax, total, received, status };
}

export const invoicesApi = {
  list(params: InvoiceFilters = {}): Promise<Paged<Invoice>> {
    let rows = db.invoices.filter(
      (i) =>
        textMatch([i.number, i.clientName, i.clientCode], params.search) &&
        (!params.status || i.status === params.status) &&
        (!params.client || i.clientId === params.client),
    );
    rows = sortRows(rows, params, {
      number: (i) => i.number,
      client: (i) => i.clientName,
      issueDate: (i) => i.issueDate,
      dueDate: (i) => i.dueDate,
      total: (i) => i.total,
      received: (i) => i.received,
    });
    return resolve(paginate(rows, params));
  },

  get(id: string): Promise<Invoice | undefined> {
    return resolve(db.invoices.find((i) => i.id === id));
  },

  create(data: Partial<Invoice>): Promise<Invoice> {
    const number = data.number ?? `INV-${String(db.invoices.length + 1).padStart(4, '0')}`;
    const base: Invoice = {
      id: nextId('inv'),
      number,
      clientId: data.clientId ?? '',
      clientName: data.clientName ?? '',
      clientCode: data.clientCode ?? '',
      issueDate: data.issueDate ?? new Date().toISOString().slice(0, 10),
      dueDate: data.dueDate ?? new Date().toISOString().slice(0, 10),
      currency: data.currency ?? 'PKR',
      status: data.status ?? 'Draft',
      lineItems: data.lineItems ?? [],
      withholdingTax: data.withholdingTax ?? 0,
      hasAttachment: false,
      payments: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      received: 0,
      ...data,
    };
    const inv = recompute(base);
    db.invoices.unshift(inv);
    return resolve(inv);
  },

  update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const idx = db.invoices.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error('Invoice not found');
    db.invoices[idx] = recompute({ ...db.invoices[idx]!, ...data });
    return resolve(db.invoices[idx]!);
  },

  recordPayment(id: string, payment: Omit<Payment, 'id'>): Promise<Invoice> {
    const idx = db.invoices.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error('Invoice not found');
    const inv = db.invoices[idx]!;
    inv.payments.push({ ...payment, id: nextId('pay') });
    db.invoices[idx] = recompute(inv);
    return resolve(db.invoices[idx]!);
  },

  setStatus(ids: string[], status: Invoice['status']): Promise<void> {
    db.invoices = db.invoices.map((i) => (ids.includes(i.id) ? recompute({ ...i, status }) : i));
    return resolve(undefined);
  },

  remove(ids: string[]): Promise<void> {
    db.invoices = db.invoices.filter((i) => !ids.includes(i.id));
    return resolve(undefined);
  },
};
