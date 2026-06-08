import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + inline error, with animated error reveal (spec: inline red message under failed field). */
export function FormField({ label, htmlFor, required, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-content">
          {label}
          {required && <span className="ml-0.5 text-brand-600">*</span>}
        </label>
      )}
      {children}
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-medium text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-xs text-content-subtle">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
