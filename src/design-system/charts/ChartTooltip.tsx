import type { TooltipProps } from 'recharts';

/** Shared themed tooltip card for all charts. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: TooltipProps<number, string> & { formatter?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface-overlay px-3 py-2 shadow-lg">
      {label !== undefined && (
        <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-content-subtle">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-content-muted">{entry.name}</span>
            <span className="nums ml-auto font-semibold text-content">
              {formatter ? formatter(entry.value as number) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
