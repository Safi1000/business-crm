import {
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';

type Align = 'start' | 'end' | 'center';
type Side = 'bottom' | 'top';

interface PopoverProps {
  /** The trigger element; receives onClick + ref. */
  trigger: ReactElement;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: Align;
  side?: Side;
  className?: string;
  /** Match the trigger width (used by type-ahead / select-like popovers). */
  matchWidth?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({
  trigger,
  children,
  align = 'end',
  side = 'bottom',
  className,
  matchWidth,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (controlledOpen === undefined) setUncontrolled(v);
    },
    [controlledOpen, onOpenChange],
  );

  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width: number;
  } | null>(null);

  // Position with top/left/right (never a CSS transform) so framer-motion's
  // animated transform (scale/y) can't clobber the alignment.
  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next: { top?: number; bottom?: number; left?: number; right?: number; width: number } = {
      width: r.width,
    };
    if (side === 'bottom') next.top = r.bottom + 6;
    else next.bottom = window.innerHeight - r.top + 6;
    if (align === 'end') next.right = Math.max(8, window.innerWidth - r.right);
    else next.left = r.left;
    setCoords(next);
  }, [align, side]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => place();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, place, setOpen]);

  const triggerEl = cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
      setOpen(!open);
    },
    'aria-expanded': open,
    'aria-haspopup': true,
  } as Record<string, unknown>);

  return (
    <>
      {triggerEl}
      {createPortal(
        <AnimatePresence>
          {open && coords && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.96, y: side === 'bottom' ? -4 : 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: side === 'bottom' ? -4 : 4 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: coords.top,
                bottom: coords.bottom,
                left: coords.left,
                right: coords.right,
                width: matchWidth ? coords.width : undefined,
                transformOrigin: `${side === 'bottom' ? 'top' : 'bottom'} ${align === 'end' ? 'right' : 'left'}`,
              }}
              className={cn(
                'z-[95] overflow-hidden rounded-xl border border-line bg-surface-overlay shadow-lg',
                className,
              )}
            >
              {typeof children === 'function' ? children(() => setOpen(false)) : children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
