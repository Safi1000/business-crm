import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  value: string;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  /** Shared layoutId so the underline morphs between tabs. */
  layoutId?: string;
  className?: string;
  variant?: 'underline' | 'pills';
}

export function Tabs({ items, value, onChange, layoutId = 'tabs', className, variant = 'underline' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={cn('inline-flex gap-1 rounded-lg bg-surface-sunken p-1', className)} role="tablist">
        {items.map((t) => {
          const active = t.value === value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.value)}
              className={cn(
                'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'text-content' : 'text-content-muted hover:text-content',
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${layoutId}-pill`}
                  className="absolute inset-0 rounded-md bg-surface shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {t.icon}
                {t.label}
                {t.count !== undefined && (
                  <span className="text-2xs text-content-subtle">{t.count}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-1 border-b border-line', className)} role="tablist">
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative px-3.5 py-2.5 text-sm font-medium transition-colors',
              active ? 'text-brand-600' : 'text-content-muted hover:text-content',
            )}
          >
            <span className="flex items-center gap-1.5">
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-2xs font-semibold',
                    active ? 'bg-brand-100 text-brand-700' : 'bg-surface-sunken text-content-muted',
                  )}
                >
                  {t.count}
                </span>
              )}
            </span>
            {active && (
              <motion.span
                layoutId={`${layoutId}-underline`}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
