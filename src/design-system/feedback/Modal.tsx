import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { springs } from '../tokens/motion';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
  /** Sticky action bar pinned to the bottom (Save / Cancel stay visible). */
  footer?: ReactNode;
  /** Disable backdrop-click + Esc (used when there are unsaved changes — caller guards). */
  dismissable?: boolean;
  className?: string;
}

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  dismissable = true,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Read these through refs so changing their identity (callers pass `onClose` inline)
  // does NOT re-run the effect below — re-running it on every keystroke stole input focus.
  const onCloseRef = useRef(onClose);
  const dismissableRef = useRef(dismissable);
  onCloseRef.current = onClose;
  dismissableRef.current = dismissable;

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissableRef.current) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => n.offsetParent !== null,
        );
        if (nodes.length === 0) return;
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);

    // Focus first field after the entrance animation kicks off.
    const raf = requestAnimationFrame(() => {
      const node = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      node?.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = '';
      cancelAnimationFrame(raf);
      prevActive?.focus?.();
    };
    // Only (re)initialise the trap when the modal opens/closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissable && onClose()}
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.15 } }}
            transition={springs.snappy}
            className={cn(
              'relative my-auto flex max-h-[calc(100vh-3rem)] w-full flex-col rounded-2xl border border-line bg-surface shadow-xl',
              sizes[size],
              className,
            )}
          >
            {(title || dismissable) && (
              <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
                <div className="min-w-0">
                  {title && <h2 className="text-lg font-semibold text-content">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-content-muted">{description}</p>}
                </div>
                {dismissable && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="-mr-1.5 -mt-0.5 rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="sticky bottom-0 flex items-center justify-end gap-2.5 rounded-b-2xl border-t border-line bg-surface/95 px-6 py-4 backdrop-blur">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
