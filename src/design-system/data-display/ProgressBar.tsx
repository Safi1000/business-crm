import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '../motion/useReducedMotion';

type ProgressTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'ink';

const fills: Record<ProgressTone, string> = {
  brand: 'bg-brand-600',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  ink: 'bg-ink-800',
};

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  tone?: ProgressTone;
  /** Auto-switch to danger/warning near/over 100 (used for budget spent %). */
  autoTone?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({
  value,
  tone = 'brand',
  autoTone,
  size = 'md',
  className,
  trackClassName,
}: ProgressBarProps) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const resolvedTone: ProgressTone = autoTone
    ? value >= 100
      ? 'danger'
      : value >= 85
        ? 'warning'
        : 'success'
    : tone;

  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-surface-sunken', size === 'sm' ? 'h-1.5' : 'h-2', trackClassName, className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn('h-full rounded-full', fills[resolvedTone])}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
