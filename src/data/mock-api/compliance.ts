import type { DocFile, DocFolder, ImportantDate } from '@/types';
import { db, nextId } from './db';
import { resolve } from './transport';

export const datesApi = {
  list(filters: { category?: string; search?: string } = {}): Promise<ImportantDate[]> {
    return resolve(
      db.importantDates.filter(
        (d) =>
          (!filters.category || d.category === filters.category) &&
          (!filters.search || d.title.toLowerCase().includes(filters.search.toLowerCase())),
      ),
    );
  },
  create(data: Partial<ImportantDate>): Promise<ImportantDate> {
    const d: ImportantDate = {
      id: nextId('date'),
      title: data.title ?? 'Untitled',
      date: data.date ?? new Date().toISOString().slice(0, 10),
      category: data.category ?? 'Other',
      advanceNoticeDays: data.advanceNoticeDays ?? 14,
      priority: data.priority ?? 'Medium',
      completed: false,
      ...data,
    };
    db.importantDates.unshift(d);
    return resolve(d);
  },
  update(id: string, data: Partial<ImportantDate>): Promise<ImportantDate> {
    const idx = db.importantDates.findIndex((d) => d.id === id);
    if (idx < 0) throw new Error('Date not found');
    db.importantDates[idx] = { ...db.importantDates[idx]!, ...data };
    return resolve(db.importantDates[idx]!);
  },
  remove(id: string): Promise<void> {
    db.importantDates = db.importantDates.filter((d) => d.id !== id);
    return resolve(undefined);
  },
};

export const documentsApi = {
  folders(): Promise<DocFolder[]> {
    return resolve(db.docFolders);
  },
  files(folderId: string): Promise<DocFile[]> {
    return resolve(db.docFiles.filter((f) => f.folderId === folderId));
  },
};
