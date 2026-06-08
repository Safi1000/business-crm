import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  X,
  ListTodo,
  AtSign,
  Receipt,
  CalendarClock,
  Wallet,
  CheckCheck,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/format';
import { Tabs } from '@ds/primitives';
import { EmptyState } from '@ds/feedback';
import { slideInRight } from '@ds/motion';
import { useUIStore } from '@/app/stores/ui';
import { notificationsApi } from '@/data/mock-api';
import { qk } from '@/data/query-keys';
import type { NotificationType } from '@/types';

const ICONS: Record<NotificationType, typeof Bell> = {
  task_assigned: ListTodo,
  mention: AtSign,
  invoice_overdue: Receipt,
  date_approaching: CalendarClock,
  payroll_processed: Wallet,
  approval_requested: CheckCheck,
};

export function NotificationsPanel() {
  const open = useUIStore((s) => s.notificationsOpen);
  const setOpen = useUIStore((s) => s.setNotificationsOpen);
  const [tab, setTab] = useState('all');
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: qk.notifications, queryFn: notificationsApi.list });

  const filtered = items.filter((n) =>
    tab === 'unread' ? !n.read : tab === 'mentions' ? n.mention : true,
  );

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    qc.invalidateQueries({ queryKey: qk.notifications });
  };
  const markAll = async () => {
    await notificationsApi.markAllRead();
    qc.invalidateQueries({ queryKey: qk.notifications });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm"
          />
          <motion.aside
            variants={slideInRight}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col border-l border-line bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-content">
                <Bell size={18} /> Notifications
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-content-subtle hover:bg-surface-sunken hover:text-content"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-3 pt-3">
              <Tabs
                variant="pills"
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'mentions', label: 'Mentions' },
                ]}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {filtered.length === 0 ? (
                <EmptyState icon={Bell} title="You're all caught up" size="sm" description="No notifications here." />
              ) : (
                <div className="flex flex-col gap-1">
                  {filtered.map((n) => {
                    const Icon = ICONS[n.type];
                    return (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          'flex gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surface-sunken',
                          !n.read && 'bg-brand-50/50 dark:bg-brand-950/20',
                        )}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-content-muted">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-content">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
                          </span>
                          <span className="mt-0.5 block text-sm text-content-muted">{n.body}</span>
                          <span className="mt-1 block text-2xs text-content-subtle">{timeAgo(n.at)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-3">
              <button onClick={markAll} className="flex items-center gap-1.5 text-sm font-medium text-content-muted hover:text-content">
                <CheckCheck size={15} /> Mark all read
              </button>
              <button className="flex items-center gap-1.5 text-sm font-medium text-content-muted hover:text-content">
                <Settings size={15} /> Settings
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
