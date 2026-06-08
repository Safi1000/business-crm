import type { HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning';
  onRemove?: () => void;
  dot?: string;
};

const tones = {
  neutral: 'bg-surface-sunken text-content-muted',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40',
  info: 'bg-info-soft text-info-strong',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
};

/** Small label/tag chip — task labels, filter pills, multi-select values. */
export function Chip({ tone = 'neutral', onRemove, dot, className, children, ...rest }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="-mr-0.5 rounded-sm opacity-60 hover:opacity-100"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
