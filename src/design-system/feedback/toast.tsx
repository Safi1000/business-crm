import { create } from 'zustand';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Optional inline action — e.g. "Undo" on bulk operations. */
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

let counter = 0;
const nextId = () => `t${++counter}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = nextId();
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    const duration = t.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), duration);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Imperative API — `toast.success('Saved')`. Spec: top-right, auto-dismiss 4s. */
export const toast = {
  success: (title: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ tone: 'success', title, ...opts }),
  error: (title: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ tone: 'error', title, ...opts }),
  warning: (title: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ tone: 'warning', title, ...opts }),
  info: (title: string, opts?: Partial<Toast>) =>
    useToastStore.getState().push({ tone: 'info', title, ...opts }),
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const accents = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

function ToastCard({ t }: { t: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = icons[t.tone];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80) dismiss(t.id);
  };

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="pointer-events-auto flex w-[360px] max-w-[90vw] cursor-grab items-start gap-3 rounded-xl border border-line bg-surface-overlay p-4 shadow-lg active:cursor-grabbing"
      role="status"
    >
      <Icon size={20} className={cn('mt-0.5 shrink-0', accents[t.tone])} strokeWidth={2.2} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-content">{t.title}</p>
        {t.description && <p className="mt-0.5 text-sm text-content-muted">{t.description}</p>}
        {t.action && (
          <button
            onClick={() => {
              t.action?.onClick();
              dismiss(t.id);
            }}
            className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => dismiss(t.id)}
        aria-label="Dismiss"
        className="rounded-md text-content-subtle hover:text-content"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
