/** Deterministic helpers so fixtures are stable across reloads. */

let _seed = 1337;
export function rand(): number {
  // Mulberry32
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function resetSeed(s = 1337): void {
  _seed = s;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

export function int(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function chance(p: number): boolean {
  return rand() < p;
}

/** Platform reference "today" — keeps overdue/upcoming demo data meaningful. */
export const TODAY = new Date('2026-06-08T09:00:00');

export function isoOffset(daysFromToday: number, base: Date = TODAY): string {
  const d = new Date(base);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export function isoDateTimeOffset(hoursFromNow: number, base: Date = TODAY): string {
  const d = new Date(base);
  d.setHours(d.getHours() + hoursFromNow);
  return d.toISOString();
}

export function pad(n: number, width = 4): string {
  return String(n).padStart(width, '0');
}
