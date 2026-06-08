import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn('skeleton block', className)} aria-hidden />;
}

/** Shimmering placeholder rows for tables — matches the real table rhythm so
 *  the skeleton → data crossfade never causes a layout jump (brief). */
export function SkeletonTable({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line" aria-hidden>
      <div className="flex gap-4 border-b border-line bg-surface-sunken px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-3.5 flex-1 rounded', c === 0 && 'max-w-[80px]')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-line bg-surface p-5', className)} aria-hidden>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="mt-4 h-7 w-32 rounded" />
      <Skeleton className="mt-3 h-3 w-20 rounded" />
    </div>
  );
}
