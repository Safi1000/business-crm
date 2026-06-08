import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** Exact CTA copy comes from the spec per page. */
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/** Illustrated empty state — never a blank table (brief: "No blank screens, ever"). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-dotgrid text-center',
        size === 'sm' ? 'px-6 py-10' : 'px-6 py-16',
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="relative mb-4"
      >
        <div className="absolute inset-0 -z-0 scale-150 rounded-full bg-brand-500/10 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface shadow-sm">
          <Icon size={28} className="text-brand-500" strokeWidth={1.8} />
        </div>
      </motion.div>
      <h3 className="text-base font-semibold text-content">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-content-muted">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-5 flex items-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
