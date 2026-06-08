import { useCallback } from 'react';
import { formatMoney } from '@/lib/format';
import { convertFromPKR } from '@/lib/fx';
import { useUIStore } from '@/app/stores/ui';

/**
 * Returns a money formatter bound to the active presentation currency. Fixture
 * amounts are PKR; when another currency is selected (P1) the value is converted
 * via FX before formatting, so the switch is meaningful, not just a symbol swap.
 */
export function useFormatMoney() {
  const currency = useUIStore((s) => s.currency);
  return useCallback(
    (amountPkr: number, opts?: { compact?: boolean; decimals?: number }) =>
      formatMoney(convertFromPKR(amountPkr, currency), currency, opts),
    [currency],
  );
}
