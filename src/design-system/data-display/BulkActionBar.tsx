import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { slideUp } from '../tokens/motion';

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  children: ReactNode;
}

/** Slides up from the bottom when 1+ rows selected (brief + spec A1.5). */
export function BulkActionBar({ count, onClear, children }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="show"
          exit="exit"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-ink-900 px-3 py-2.5 text-white shadow-xl dark:bg-surface-overlay dark:text-content">
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">
                {count}
              </span>
              <span className="text-sm font-medium">selected</span>
            </div>
            <div className="h-5 w-px bg-white/20 dark:bg-line" />
            <div className="flex items-center gap-1.5">{children}</div>
            <button
              onClick={onClear}
              aria-label="Clear selection"
              className="ml-1 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white dark:text-content-muted dark:hover:bg-surface-sunken"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
