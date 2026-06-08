import type { Paged, Quote } from '@/types';
import { db, nextId } from './db';
import { paginate, resolve, sortRows, textMatch, type ListParams } from './transport';

export interface QuoteFilters extends ListParams {
  status?: string;
}

export const quotesApi = {
  list(params: QuoteFilters = {}): Promise<Paged<Quote>> {
    let rows = db.quotes.filter(
      (q) => textMatch([q.number, q.clientName, q.clientCode], params.search) && (!params.status || q.status === params.status),
    );
    rows = sortRows(rows, params, { number: (q) => q.number, client: (q) => q.clientName, issueDate: (q) => q.issueDate, total: (q) => q.total });
    return resolve(paginate(rows, params));
  },

  create(data: Partial<Quote>): Promise<Quote> {
    const client = db.clients.find((c) => c.id === data.clientId);
    const q: Quote = {
      id: nextId('quo'),
      number: `QUO-${String(db.quotes.length + 1).padStart(4, '0')}`,
      clientId: data.clientId ?? '',
      clientName: client?.name ?? '',
      clientCode: client?.code ?? '',
      issueDate: data.issueDate ?? new Date().toISOString().slice(0, 10),
      expiryDate: data.expiryDate ?? new Date().toISOString().slice(0, 10),
      currency: data.currency ?? 'PKR',
      status: 'Draft',
      total: data.total ?? 0,
    };
    db.quotes.unshift(q);
    return resolve(q);
  },

  setStatus(id: string, status: Quote['status']): Promise<Quote> {
    const q = db.quotes.find((x) => x.id === id);
    if (!q) throw new Error('Quote not found');
    q.status = status;
    return resolve(q);
  },

  /** Convert an accepted quote into a real draft invoice. */
  convert(id: string): Promise<Quote> {
    const q = db.quotes.find((x) => x.id === id);
    if (!q) throw new Error('Quote not found');
    const invId = nextId('inv');
    db.invoices.unshift({
      id: invId,
      number: `INV-${String(db.invoices.length + 1).padStart(4, '0')}`,
      clientId: q.clientId,
      clientName: q.clientName,
      clientCode: q.clientCode,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      currency: q.currency,
      status: 'Draft',
      lineItems: [{ id: nextId('li'), description: `From quote ${q.number}`, quantity: 1, rate: q.total, taxRate: 0 }],
      withholdingTax: 0,
      hasAttachment: false,
      payments: [],
      subtotal: q.total,
      tax: 0,
      total: q.total,
      received: 0,
    });
    q.status = 'Accepted';
    q.convertedInvoiceId = invId;
    return resolve(q);
  },
};
