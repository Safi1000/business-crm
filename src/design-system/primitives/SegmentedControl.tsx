import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Segment {
  value: string;
  label?: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
  layoutId?: string;
}

/** Compact toggle group — used for List/Board/Calendar view switches. */
export function SegmentedControl({
  segments,
  value,
  onChange,
  size = 'md',
  className,
  layoutId = 'segment',
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-sunken p-0.5',
        className,
      )}
      role="tablist"
    >
      {segments.map((s) => {
        const active = s.value === value;
        const Icon = s.icon;
        return (
          <button
            key={s.value}
            role="tab"
            aria-selected={active}
            aria-label={s.label}
            onClick={() => onChange(s.value)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-md font-medium transition-colors',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
              active ? 'text-content' : 'text-content-muted hover:text-content',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${layoutId}-bg`}
                className="absolute inset-0 rounded-md bg-surface shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2.2} />}
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
