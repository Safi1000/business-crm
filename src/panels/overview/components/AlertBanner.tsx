import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DashboardAlert } from '@/data/mock-api';
import { routes } from '@/config/routes';

/**
 * Resolve where an alert's "View" link should go (BUG-06). Prefer an explicit
 * href from the backend; otherwise infer from the message so e.g. a payroll
 * alert lands on Payroll instead of the Important Dates page.
 */
function alertHref(a: DashboardAlert): string {
  if (a.href) return a.href;
  const m = a.message.toLowerCase();
  if (m.includes('payroll') || m.includes('payslip') || m.includes('disburse')) return routes.payroll;
  if (m.includes('invoice') || m.includes('receivable') || m.includes('overdue')) return routes.invoices;
  if (m.includes('leave')) return routes.leaves;
  if (m.includes('timesheet')) return routes.timesheets;
  if (m.includes('attendance')) return routes.attendance;
  if (m.includes('expense')) return routes.expenses;
  return routes.importantDates;
}

/** Dismissible alert strip — only shown when at least one alert is active (A3 §A). */
export function AlertBanner({ alerts }: { alerts: DashboardAlert[] }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || alerts.length === 0) return null;

  const hasDanger = alerts.some((a) => a.tone === 'danger');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 overflow-hidden"
      >
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border px-4 py-3',
            hasDanger
              ? 'border-danger/30 bg-danger-soft/60'
              : 'border-warning/30 bg-warning-soft/60',
          )}
        >
          <AlertTriangle
            size={20}
            className={cn('mt-0.5 shrink-0', hasDanger ? 'text-danger' : 'text-warning-strong')}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-content">
              {alerts.length} item{alerts.length > 1 ? 's need' : ' needs'} your attention
            </p>
            <ul className="mt-1 space-y-0.5">
              {alerts.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => navigate(alertHref(a))}
                    className="text-left text-sm text-content-muted hover:text-brand-600 hover:underline"
                  >
                    • {a.message}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => navigate(alertHref(alerts[0]!))}
            className="shrink-0 whitespace-nowrap text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss alerts"
            className="-mr-1 shrink-0 rounded-md p-1 text-content-subtle hover:bg-surface/50 hover:text-content"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
