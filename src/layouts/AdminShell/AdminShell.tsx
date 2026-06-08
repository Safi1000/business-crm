import { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt, CreditCard, ListTodo, UserPlus } from 'lucide-react';
import { SideBar } from './SideBar';
import { TopBar } from './TopBar';
import { NotificationsPanel } from './NotificationsPanel';
import { AIAssistant } from '@/floating';
import { CommandMenu, type CommandGroup } from '@ds/overlays';
import { routeTransition } from '@ds/motion';
import { useUIStore } from '@/app/stores/ui';
import { useAuthStore } from '@/app/stores/auth';
import { navGroups } from '@/config/nav';
import { isPhaseActive } from '@/config/phases';
import { routes } from '@/config/routes';

export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const commandOpen = useUIStore((s) => s.commandOpen);
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const authenticated = useAuthStore((s) => s.authenticated);

  // ⌘K / Ctrl+K toggles the command palette anywhere in the shell.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(!useUIStore.getState().commandOpen);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setCommandOpen]);

  const commandGroups: CommandGroup[] = useMemo(
    () => [
      {
        heading: 'Quick create',
        items: [
          { id: 'qc-invoice', label: 'New Invoice', icon: Receipt, onSelect: () => navigate(routes.invoiceNew) },
          { id: 'qc-expense', label: 'New Expense', icon: CreditCard, onSelect: () => navigate(`${routes.expenses}?new=1`) },
          { id: 'qc-task', label: 'New Task', icon: ListTodo, onSelect: () => navigate(`${routes.tasks}?new=1`) },
          { id: 'qc-client', label: 'New Client', icon: UserPlus, onSelect: () => navigate(`${routes.clients}?new=1`) },
        ],
      },
      ...navGroups.map((g) => ({
        heading: g.heading,
        items: g.items
          .filter((i) => isPhaseActive(i.phase))
          .map((i) => ({
            id: i.to,
            label: i.label,
            icon: i.icon,
            keywords: g.heading,
            onSelect: () => navigate(i.to),
          })),
      })),
    ],
    [navigate],
  );

  if (!authenticated) return <Navigate to={routes.login} replace />;

  return (
    <div className="min-h-screen bg-app">
      <SideBar />
      <TopBar />
      <main
        className={`pt-topbar transition-[padding] duration-300 ${collapsed ? 'pl-sidebar-collapsed' : 'pl-sidebar'}`}
      >
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Entrance-only, keyed by path — avoids AnimatePresence deadlocking on
              lazy/Suspense route children (which left the page blank). */}
          <motion.div key={location.pathname} variants={routeTransition} initial="hidden" animate="show">
            {outlet}
          </motion.div>
        </div>
      </main>

      <CommandMenu open={commandOpen} onClose={() => setCommandOpen(false)} groups={commandGroups} />
      <NotificationsPanel />
      <AIAssistant />
    </div>
  );
}
