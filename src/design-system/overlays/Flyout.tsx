import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface FlyoutProps {
  /** Anchor content (always visible). */
  children: ReactNode;
  /** Panel content shown to the right on hover/focus. */
  content: ReactNode;
  className?: string;
  panelClassName?: string;
  disabled?: boolean;
}

/**
 * Hover/focus flyout anchored to the right of its trigger — powers the
 * collapsed-sidebar group flyout (spec A1.3: "On hover in collapsed mode, a
 * flyout shows the group name and children").
 */
export function Flyout({ children, content, className, panelClassName, disabled }: FlyoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    if (disabled) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) setCoords({ top: r.top, left: r.right + 8 });
  };
  const hide = () => setCoords(null);

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {coords && (
            <motion.div
              initial={{ opacity: 0, x: -6, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -6, scale: 0.97 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'fixed', top: coords.top, left: coords.left }}
              onMouseEnter={show}
              onMouseLeave={hide}
              className={cn(
                'z-[95] min-w-[200px] rounded-xl border border-line bg-surface-overlay p-1.5 shadow-lg',
                panelClassName,
              )}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
