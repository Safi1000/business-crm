import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * URL-persisted filter state. Every list page's filter bar reads/writes here so
 * filters survive refresh and are shareable (spec A1.4: "Persist in URL query params").
 */
export function useUrlFilters<T extends Record<string, string | undefined>>(defaults: T) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const out = { ...defaults } as T;
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const v = params.get(key as string);
      if (v !== null) out[key] = v as T[keyof T];
    }
    return out;
  }, [params, defaults]);

  const set = useCallback(
    (patch: Partial<T>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === '' || v === defaults[k as keyof T]) next.delete(k);
            else next.set(k, String(v));
          }
          // Reset to page 1 when any non-page filter changes.
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams, defaults],
  );

  const reset = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const activeCount = useMemo(
    () =>
      (Object.keys(defaults) as (keyof T)[]).filter(
        (k) => values[k] !== undefined && values[k] !== '' && values[k] !== defaults[k],
      ).length,
    [values, defaults],
  );

  return { values, set, reset, activeCount };
}
