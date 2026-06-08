/* Formatting utilities. Currency is built multi-currency-ready from day one. */

export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED';

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  PKR: 'en-PK',
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
  AED: 'en-AE',
};

/**
 * Format a money amount. Presentation-currency switching (P1) flows through
 * here — callers pass the currency, so multi-currency drops in cleanly.
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = 'PKR',
  opts: { compact?: boolean; decimals?: number } = {},
): string {
  const { compact = false, decimals } = opts;
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? 'en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: decimals ?? (compact ? 1 : 0),
    minimumFractionDigits: decimals ?? 0,
  }).format(amount);
}

/** Bare number with thousands separators (no currency symbol). */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value >= 0 ? '' : ''}${formatNumber(value, decimals)}%`;
}

export function formatDate(
  value: string | Date,
  style: 'short' | 'medium' | 'long' = 'medium',
): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const opts: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { day: '2-digit', month: 'short' }
      : style === 'long'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB', opts).format(d);
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

const MS_PER_DAY = 86_400_000;

/** Whole-day difference from today (negative = past). Uses a fixed "today" so
 *  fixtures stay deterministic relative to the spec's reference date. */
export function daysUntil(value: string | Date, today: Date = new Date()): number {
  const d = typeof value === 'string' ? new Date(value) : value;
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / MS_PER_DAY);
}

/** Human label + severity for a deadline/due date, used by date badges. */
export function dueStatus(value: string | Date): {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  days: number;
} {
  const days = daysUntil(value);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, tone: 'danger', days };
  if (days === 0) return { label: 'Due today', tone: 'danger', days };
  if (days <= 7) return { label: `${days}d left`, tone: 'warning', days };
  if (days <= 30) return { label: `${days}d left`, tone: 'warning', days };
  return { label: `${days}d left`, tone: 'neutral', days };
}

/** Relative "time ago" for activity feeds / audit logs. */
export function timeAgo(value: string | Date, now: Date = new Date()): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const diff = Math.round((now.getTime() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const ranges: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, secs] of ranges) {
    if (Math.abs(diff) >= secs || unit === 'second') {
      return rtf.format(-Math.round(diff / secs), unit);
    }
  }
  return 'just now';
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
