/*
 * JS-side color tokens. These mirror styles/tokens.css and exist because SVG
 * chart libraries (Recharts) need concrete color strings, not CSS-var attrs.
 * This file (inside tokens/) is one of the sanctioned homes for raw values.
 */

export const palette = {
  brand: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  ink: {
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    900: '#0f172a',
  },
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
} as const;

/**
 * Ordered, distinct series colors for multi-series charts (revenue-by-client
 * bars, etc.). Brand red leads; the rest are tuned to sit beside it.
 */
export const chartSeries = [
  '#dc2626', // brand red
  '#2563eb', // blue
  '#0d9488', // teal
  '#d97706', // amber
  '#7c3aed', // violet
  '#db2777', // pink
  '#16a34a', // green
  '#0891b2', // cyan
  '#ea580c', // orange
  '#4f46e5', // indigo
] as const;

/** Semantic chart roles used across cashflow / attendance charts. */
export const chartRoles = {
  revenue: '#16a34a',
  expenses: '#dc2626',
  payroll: '#2563eb',
  present: '#22c55e',
  absent: '#ef4444',
  leave: '#f59e0b',
  net: '#0f172a',
} as const;

/** Read a live CSS variable (handles theme switching). Returns rgb() string. */
export function cssVar(name: string): string {
  if (typeof window === 'undefined') return '';
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `rgb(${v})` : '';
}
