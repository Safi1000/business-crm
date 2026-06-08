import { cn } from '@/lib/cn';
import { dueStatus } from '@/lib/format';

const tone = {
  danger: 'bg-danger-soft text-danger-strong',
  warning: 'bg-warning-soft text-warning-strong',
  success: 'bg-success-soft text-success-strong',
  neutral: 'bg-surface-sunken text-content-muted',
};

/**
 * Auto-calculated day-count badge with color thresholds (brief). Used for due
 * dates, contract expiry, important dates. Red overdue, amber soon, grey later.
 */
export function DateBadge({ date, className }: { date: string | Date; className?: string }) {
  const { label, tone: t } = dueStatus(date);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-2xs font-semibold',
        tone[t],
        className,
      )}
    >
      {label}
    </span>
  );
}
