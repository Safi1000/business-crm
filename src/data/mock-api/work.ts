import type { Contract, Paged, Project, Task } from '@/types';
import { db, nextId } from './db';
import { paginate, resolve, sortRows, textMatch, type ListParams } from './transport';

export interface ContractFilters extends ListParams {
  type?: string;
  status?: string;
}

export const contractsApi = {
  list(params: ContractFilters = {}): Promise<Paged<Contract>> {
    let rows = db.contracts.filter(
      (c) =>
        textMatch([c.code, c.clientName], params.search) &&
        (!params.type || c.type === params.type) &&
        (!params.status || c.status === params.status),
    );
    rows = sortRows(rows, params, {
      code: (c) => c.code,
      client: (c) => c.clientName,
      endDate: (c) => c.endDate,
      value: (c) => c.value,
    });
    return resolve(paginate(rows, params));
  },

  create(data: Partial<Contract>): Promise<Contract> {
    const client = db.clients.find((c) => c.id === data.clientId);
    const contract: Contract = {
      id: nextId('con'),
      code: `CON-${String(db.contracts.length + 1).padStart(4, '0')}`,
      clientId: data.clientId ?? '',
      clientName: client?.name ?? data.clientName ?? '',
      type: data.type ?? 'Service Agreement',
      startDate: data.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: data.endDate ?? new Date().toISOString().slice(0, 10),
      value: data.value ?? 0,
      currency: data.currency ?? 'PKR',
      monthlyValue: data.type === 'Retainer' ? Math.round((data.value ?? 0) / 12) : undefined,
      autoInvoice: data.autoInvoice ?? false,
      status: 'Active',
    };
    db.contracts.unshift(contract);
    return resolve(contract);
  },

  update(id: string, data: Partial<Contract>): Promise<Contract> {
    const idx = db.contracts.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Contract not found');
    db.contracts[idx] = { ...db.contracts[idx]!, ...data };
    return resolve(db.contracts[idx]!);
  },

  renew(id: string, endDate: string): Promise<Contract> {
    return contractsApi.update(id, { status: 'Active', endDate });
  },

  cancel(id: string): Promise<Contract> {
    return contractsApi.update(id, { status: 'Cancelled' });
  },
};

export interface ProjectFilters extends ListParams {
  client?: string;
  status?: string;
  billingModel?: string;
}

export const projectsApi = {
  list(params: ProjectFilters = {}): Promise<Paged<Project>> {
    let rows = db.projects.filter(
      (p) =>
        textMatch([p.name, p.code, p.clientName, p.managerName], params.search) &&
        (!params.client || p.clientId === params.client) &&
        (!params.status || p.status === params.status) &&
        (!params.billingModel || p.billingModel === params.billingModel),
    );
    rows = sortRows(rows, params, {
      name: (p) => p.name,
      code: (p) => p.code,
      endDate: (p) => p.endDate,
      spent: (p) => p.spent,
    });
    return resolve(paginate(rows, params));
  },
  get(id: string): Promise<Project | undefined> {
    return resolve(db.projects.find((p) => p.id === id));
  },
  create(data: Partial<Project>): Promise<Project> {
    const client = db.clients.find((c) => c.id === data.clientId);
    const project: Project = {
      id: nextId('prj'),
      code: `PRJ-${String(db.projects.length + 1).padStart(4, '0')}`,
      name: data.name ?? 'New Project',
      clientId: data.clientId ?? '',
      clientName: client?.name ?? data.clientName ?? '',
      managerName: data.managerName ?? 'Faisal Malik',
      status: data.status ?? 'Lead',
      billingModel: data.billingModel ?? 'Fixed',
      budget: data.budget ?? null,
      spent: 0,
      currency: data.currency ?? 'PKR',
      startDate: data.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: data.endDate ?? new Date().toISOString().slice(0, 10),
    };
    db.projects.unshift(project);
    return resolve(project);
  },
  update(id: string, data: Partial<Project>): Promise<Project> {
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Project not found');
    db.projects[idx] = { ...db.projects[idx]!, ...data };
    return resolve(db.projects[idx]!);
  },
};

export interface TaskFilters extends ListParams {
  assignee?: string;
  priority?: string;
  project?: string;
  label?: string;
  status?: string;
}

export const tasksApi = {
  list(params: TaskFilters = {}): Promise<Task[]> {
    const rows = db.tasks.filter(
      (t) =>
        textMatch([t.title, t.projectName ?? undefined], params.search) &&
        (!params.assignee || t.assignees.includes(params.assignee)) &&
        (!params.priority || t.priority === params.priority) &&
        (!params.project || t.projectId === params.project) &&
        (!params.label || t.labels.includes(params.label)) &&
        (!params.status || t.status === params.status),
    );
    return resolve(rows);
  },
  get(id: string): Promise<Task | undefined> {
    return resolve(db.tasks.find((t) => t.id === id));
  },
  create(data: Partial<Task>): Promise<Task> {
    const task: Task = {
      id: nextId('task'),
      title: data.title ?? 'New Task',
      projectId: data.projectId ?? null,
      projectName: data.projectName ?? null,
      assignees: data.assignees ?? [],
      priority: data.priority ?? 'Medium',
      status: data.status ?? 'To Do',
      dueDate: data.dueDate ?? null,
      labels: data.labels ?? [],
      checklist: [],
      comments: [],
      hoursLogged: 0,
      createdBy: 'Faisal Malik',
      createdAt: new Date().toISOString().slice(0, 10),
      ...data,
    };
    db.tasks.unshift(task);
    return resolve(task);
  },
  update(id: string, data: Partial<Task>): Promise<Task> {
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('Task not found');
    db.tasks[idx] = { ...db.tasks[idx]!, ...data };
    return resolve(db.tasks[idx]!);
  },
};
