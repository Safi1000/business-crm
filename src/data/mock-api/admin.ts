import type { AppNotification, AppUser, Branch, CompanyProfile, Department } from '@/types';
import { db, nextId } from './db';
import { resolve } from './transport';

export const usersApi = {
  list(search?: string): Promise<AppUser[]> {
    return resolve(
      db.users.filter(
        (u) =>
          !search ||
          [u.name, u.email, u.title].some((f) => f.toLowerCase().includes(search.toLowerCase())),
      ),
    );
  },
  create(data: Partial<AppUser>): Promise<AppUser> {
    const u: AppUser = {
      id: nextId('usr'),
      name: data.name ?? '',
      email: data.email ?? '',
      title: data.title ?? '',
      permissions: data.permissions ?? [],
      role: data.role ?? 'Ops',
    };
    db.users.push(u);
    return resolve(u);
  },
  update(id: string, data: Partial<AppUser>): Promise<AppUser> {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) throw new Error('User not found');
    db.users[idx] = { ...db.users[idx]!, ...data };
    return resolve(db.users[idx]!);
  },
  remove(id: string): Promise<void> {
    db.users = db.users.filter((u) => u.id !== id);
    return resolve(undefined);
  },
};

export const settingsApi = {
  company(): Promise<CompanyProfile> {
    return resolve(db.company);
  },
  updateCompany(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    db.company = { ...db.company, ...data };
    return resolve(db.company);
  },
  branches(): Promise<Branch[]> {
    return resolve(db.branches);
  },
  departments(): Promise<Department[]> {
    return resolve(db.departments);
  },
};

export const notificationsApi = {
  list(): Promise<AppNotification[]> {
    return resolve(db.notifications);
  },
  markRead(id: string): Promise<void> {
    const n = db.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    return resolve(undefined);
  },
  markAllRead(): Promise<void> {
    db.notifications.forEach((n) => (n.read = true));
    return resolve(undefined);
  },
};
