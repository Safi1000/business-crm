/*
 * THE SWAP SEAM.
 *
 * Every mock-api resource module routes through `resolve()` / `reject()` here.
 * To move to a real backend, replace the bodies of these helpers with `fetch`
 * calls — the resource modules and all calling code stay unchanged. That is the
 * "one-file change" the brief asks for.
 */

import type { Paged } from '@/types';

const BASE_LATENCY = 320;

/** Toggle to exercise error/retry states in the gallery & dev. */
export const mockConfig = {
  failRate: 0, // 0..1 — probability a read fails (set >0 to demo retry)
  latency: BASE_LATENCY,
};

function latency(): number {
  return mockConfig.latency + Math.random() * 220;
}

/** Resolve with data after simulated network latency. Swap for `fetch().then(r => r.json())`. */
export function resolve<T>(data: T, opts: { latency?: number } = {}): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(
      () => {
        if (mockConfig.failRate > 0 && Math.random() < mockConfig.failRate) {
          rej(new Error('Network error'));
        } else {
          // structuredClone so callers can't mutate the in-memory store by reference.
          res(structuredClone(data));
        }
      },
      opts.latency ?? latency(),
    );
  });
}

export function reject(message = 'Request failed'): Promise<never> {
  return new Promise((_, rej) => setTimeout(() => rej(new Error(message)), latency()));
}

/* ---------------- Generic query helpers shared by resource modules ---------------- */

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}

export function textMatch(haystack: Array<string | undefined>, query?: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return haystack.some((h) => h?.toLowerCase().includes(q));
}

export function paginate<T>(rows: T[], params: ListParams): Paged<T> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
}

export function sortRows<T>(rows: T[], params: ListParams, accessors: Record<string, (r: T) => string | number>): T[] {
  if (!params.sortKey || !accessors[params.sortKey]) return rows;
  const acc = accessors[params.sortKey]!;
  const dir = params.sortDir === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = acc(a);
    const bv = acc(b);
    return av === bv ? 0 : av < bv ? -dir : dir;
  });
}
