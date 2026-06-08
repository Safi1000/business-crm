import { cn } from '@/lib/cn';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success-strong ring-success/20',
  warning: 'bg-warning-soft text-warning-strong ring-warning/20',
  danger: 'bg-danger-soft text-danger-strong ring-danger/20',
  info: 'bg-info-soft text-info-strong ring-info/20',
  neutral: 'bg-surface-sunken text-content-muted ring-line-strong/40',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200/60 dark:bg-brand-950/40',
};

const dotColor: Record<BadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-400',
  brand: 'bg-brand-600',
};

/**
 * Maps every domain status string used across the platform to a tone.
 * Spec A1.5: green=success/active, amber=pending, red=overdue/failed, grey=inactive.
 */
const STATUS_TONE: Record<string, BadgeTone> = {
  // generic
  active: 'success',
  inactive: 'neutral',
  paid: 'success',
  approved: 'success',
  completed: 'success',
  disbursed: 'success',
  cleared: 'success',
  reimbursed: 'success',
  resolved: 'success',
  done: 'success',
  pending: 'warning',
  partial: 'warning',
  draft: 'neutral',
  sent: 'info',
  submitted: 'info',
  'in progress': 'info',
  'on hold': 'warning',
  'on leave': 'warning',
  review: 'info',
  lead: 'brand',
  overdue: 'danger',
  expired: 'danger',
  cancelled: 'danger',
  rejected: 'danger',
  failed: 'danger',
  uncollectible: 'danger',
  open: 'warning',
  closed: 'neutral',
  // employee/client type
  business: 'info',
  individual: 'neutral',
};

export function statusTone(status: string): BadgeTone {
  return STATUS_TONE[status.toLowerCase().trim()] ?? 'neutral';
}

interface StatusBadgeProps {
  /** The status string — tone is auto-derived, or pass `tone` to override. */
  status: string;
  tone?: BadgeTone;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, tone, dot = true, size = 'md', className }: StatusBadgeProps) {
  const t = tone ?? statusTone(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium capitalize ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        toneClasses[t],
        className,
      )}
      aria-label={`Status: ${status}`}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor[t])} />}
      {status}
    </span>
  );
}
