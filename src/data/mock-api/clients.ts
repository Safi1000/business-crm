import type { Client, Contract, Invoice, Paged } from '@/types';
import { db, nextId } from './db';
import { paginate, resolve, sortRows, textMatch, type ListParams } from './transport';

export interface ClientFilters extends ListParams {
  status?: string;
  industry?: string;
  branch?: string;
}

export const clientsApi = {
  list(params: ClientFilters = {}): Promise<Paged<Client>> {
    let rows = db.clients.filter(
      (c) =>
        textMatch([c.name, c.email, c.code], params.search) &&
        (!params.status || c.status === params.status) &&
        (!params.industry || c.industry === params.industry) &&
        (!params.branch || c.defaultBranchId === params.branch),
    );
    rows = sortRows(rows, params, {
      name: (c) => c.name,
      code: (c) => c.code,
      outstanding: (c) => c.outstanding,
      industry: (c) => c.industry,
    });
    return resolve(paginate(rows, params));
  },

  get(id: string): Promise<Client | undefined> {
    return resolve(db.clients.find((c) => c.id === id));
  },

  contracts(clientId: string): Promise<Contract[]> {
    return resolve(db.contracts.filter((c) => c.clientId === clientId));
  },

  invoices(clientId: string): Promise<Invoice[]> {
    return resolve(db.invoices.filter((i) => i.clientId === clientId));
  },

  create(data: Partial<Client>): Promise<Client> {
    const code = `CLI-${String(db.clients.length + 1).padStart(4, '0')}`;
    const client: Client = {
      id: nextId('cli'),
      code,
      name: data.name ?? 'Untitled Client',
      type: data.type ?? 'Business',
      industry: data.industry ?? 'Technology',
      country: data.country ?? 'Pakistan',
      email: data.email ?? '',
      phone: data.phone ?? '',
      status: 'Active',
      currency: data.currency ?? 'PKR',
      paymentTermsDays: data.paymentTermsDays ?? 30,
      outstanding: 0,
      activeContracts: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      ...data,
    };
    db.clients.unshift(client);
    return resolve(client);
  },

  update(id: string, data: Partial<Client>): Promise<Client> {
    const idx = db.clients.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Client not found');
    db.clients[idx] = { ...db.clients[idx]!, ...data };
    return resolve(db.clients[idx]!);
  },

  setStatus(id: string, status: Client['status']): Promise<Client> {
    return clientsApi.update(id, { status });
  },

  remove(id: string): Promise<void> {
    db.clients = db.clients.filter((c) => c.id !== id);
    return resolve(undefined);
  },
};
