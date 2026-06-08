import type { CurrencyCode } from './format';

/**
 * Static PKR-base conversion rates (mirrors data/fixtures fxRates). All fixture
 * amounts are stored in PKR; presentation-currency switching (P1) converts here.
 * Swap this for the live FX endpoint when the backend lands.
 */
export const RATES_FROM_PKR: Record<CurrencyCode, number> = {
  PKR: 1,
  USD: 0.0036,
  EUR: 0.0033,
  GBP: 0.0028,
  AED: 0.0132,
};

/** Convert a PKR amount into the target presentation currency. */
export function convertFromPKR(amountPkr: number, to: CurrencyCode): number {
  return amountPkr * (RATES_FROM_PKR[to] ?? 1);
}
