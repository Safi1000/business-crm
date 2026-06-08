import type { CurrencyCode, ID, ISODate } from './common';

export type ProjectStatus = 'Lead' | 'Active' | 'On Hold' | 'Completed';
export type BillingModel = 'Fixed' | 'T&M' | 'Retainer';

export interface Project {
  id: ID;
  code: string; // PRJ-0001
  name: string;
  clientId: ID;
  clientName: string;
  managerName: string;
  status: ProjectStatus;
  billingModel: BillingModel;
  budget: number | null;
  spent: number;
  currency: CurrencyCode;
  startDate: ISODate;
  endDate: ISODate;
}

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskComment {
  id: ID;
  author: string;
  body: string;
  at: ISODate;
}

export interface ChecklistItem {
  id: ID;
  text: string;
  done: boolean;
}

export interface Task {
  id: ID;
  title: string;
  description?: string;
  projectId: ID | null;
  projectName: string | null;
  assignees: string[];
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: ISODate | null;
  labels: string[];
  checklist: ChecklistItem[];
  comments: TaskComment[];
  hoursLogged: number;
  createdBy: string;
  createdAt: ISODate;
}
