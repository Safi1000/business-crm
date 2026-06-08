import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { CountUp } from '../motion/CountUp';
import { SkeletonCard } from '../feedback/Skeleton';

type KPITone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'ink';

const iconTones: Record<KPITone, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger-strong',
  info: 'bg-info-soft text-info-strong',
  ink: 'bg-surface-sunken text-content',
};

interface KPICardProps {
  label: string;
  /** Pre-formatted string OR a number to count-up (with `format`). */
  value: string | number;
  format?: (n: number) => string;
  delta?: { value: string; direction: 'up' | 'down'; positive?: boolean };
  icon?: LucideIcon;
  tone?: KPITone;
  loading?: boolean;
  onClick?: () => void;
  /** Renders "—" placeholder (spec: KPIs show "—" instead of zero when no data). */
  empty?: boolean;
  className?: string;
}

export function KPICard({
  label,
  value,
  format,
  delta,
  icon: Icon,
  tone = 'ink',
  loading,
  onClick,
  empty,
  className,
}: KPICardProps) {
  if (loading) return <SkeletonCard className={className} />;

  const deltaPositive = delta?.positive ?? delta?.direction === 'up';

  return (
    <motion.div
      whileHover={onClick ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-sm',
        onClick && 'cursor-pointer hover:border-line-strong hover:shadow-md focus-visible:ring-2',
        className,
      )}
    >
      {/* subtle accent glow on hover */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/0 blur-2xl transition-colors duration-300 group-hover:bg-brand-500/10" />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-content-muted">{label}</p>
        {Icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconTones[tone])}>
            <Icon size={18} strokeWidth={2.2} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="nums text-2xl font-semibold leading-none text-content">
          {empty ? (
            '—'
          ) : typeof value === 'number' && format ? (
            <CountUp value={value} format={format} />
          ) : (
            value
          )}
        </span>
      </div>
      {delta && !empty && (
        <div className="mt-2.5 flex items-center gap-1 text-xs font-medium">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded px-1 py-0.5',
              deltaPositive ? 'bg-success-soft text-success-strong' : 'bg-danger-soft text-danger-strong',
            )}
          >
            {delta.direction === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta.value}
          </span>
        </div>
      )}
    </motion.div>
  );
}
