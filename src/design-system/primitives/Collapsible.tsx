import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

/** Collapsible form section (used by Create/Edit Client & Employee modals). */
export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('overflow-hidden rounded-xl border border-line', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 bg-surface-sunken/50 px-4 py-3 text-left transition-colors hover:bg-surface-sunken"
      >
        <span>
          <span className="block text-sm font-semibold text-content">{title}</span>
          {description && <span className="block text-xs text-content-muted">{description}</span>}
        </span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-content-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
