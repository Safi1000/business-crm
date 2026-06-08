import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ChevronDown, PanelLeftClose, PanelLeftOpen, User, KeyRound, LogOut, CheckCheck, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar } from '@ds/data-display';
import { DropdownMenu, Popover } from '@ds/overlays';
import { IconButton } from '@ds/primitives';
import { routeTransition } from '@ds/motion';

const SAMPLE_NOTIFS = [
  { id: '1', title: 'New invoice issued', body: 'INV-0012 is now available to view.', when: '2h ago' },
  { id: '2', title: 'Payment received', body: 'Thanks! Your payment was recorded.', when: '1d ago' },
  { id: '3', title: 'Document shared', body: 'A new document was shared with you.', when: '3d ago' },
];

export interface PortalNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

interface PortalShellProps {
  brand: string;
  brandSub: string;
  greeting: string;
  navItems: PortalNavItem[];
  signOutTo: string;
}

/** Sidebar layout for the Client and Employee portals — mirrors the Admin shell. */
export function PortalShell({ brand, brandSub, greeting, navItems, signOutTo }: PortalShellProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const name = greeting.replace(/^(Welcome,|Welcome back,|Hi,)\s*/i, '') || 'User';

  return (
    <div className="min-h-screen bg-app">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-line bg-surface transition-[width] duration-300',
          collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        )}
      >
        <div className={cn('flex h-topbar items-center gap-2.5 border-b border-line px-4', collapsed && 'justify-center px-0')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-display text-lg font-bold text-white shadow-sm">T</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold leading-tight text-content">{brand}</p>
              <p className="truncate text-2xs text-content-subtle">{brandSub}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              title={collapsed ? n.label : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40' : 'text-content-muted hover:bg-surface-sunken hover:text-content',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span layoutId="portal-nav-active" className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand-600" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                  )}
                  <n.icon size={18} strokeWidth={2} className="shrink-0" />
                  {!collapsed && <span className="truncate">{n.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:bg-surface-sunken hover:text-content', collapsed && 'justify-center px-0')}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className={cn('fixed right-0 top-0 z-20 flex h-topbar items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md transition-[left] duration-300 sm:px-6', collapsed ? 'left-sidebar-collapsed' : 'left-sidebar')}>
        <p className="text-sm font-medium text-content">{greeting}</p>
        <div className="ml-auto flex items-center gap-2">
          <Popover
            align="end"
            trigger={
              <span className="relative inline-flex">
                <IconButton icon={Bell} label="Notifications" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-2xs font-bold text-white">{SAMPLE_NOTIFS.length}</span>
              </span>
            }
          >
            {(close) => (
              <div className="w-[320px]">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="text-sm font-semibold text-content">Notifications</span>
                  <button onClick={close} className="flex items-center gap-1 text-2xs font-medium text-content-muted hover:text-content"><CheckCheck size={13} /> Mark all read</button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-1.5">
                  {SAMPLE_NOTIFS.map((n) => (
                    <div key={n.id} className="flex gap-3 rounded-lg p-2.5 hover:bg-surface-sunken">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40"><Bell size={15} /></span>
                      <div className="min-w-0"><p className="text-sm font-medium text-content">{n.title}</p><p className="text-xs text-content-muted">{n.body}</p><p className="mt-0.5 text-2xs text-content-subtle">{n.when}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Popover>
          <DropdownMenu
            align="end"
            trigger={<button className="flex items-center gap-1.5 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-sunken"><Avatar name={name} size="sm" /><ChevronDown size={14} className="hidden text-content-subtle sm:block" /></button>}
            items={[
              { label: 'My Profile', icon: User },
              { label: 'Change Password', icon: KeyRound },
              'divider',
              { label: 'Sign Out', icon: LogOut, danger: true, onClick: () => { window.location.href = signOutTo; } },
            ]}
          />
        </div>
      </header>

      {/* Content */}
      <main className={cn('pt-topbar transition-[padding] duration-300', collapsed ? 'pl-sidebar-collapsed' : 'pl-sidebar')}>
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <motion.div key={location.pathname} variants={routeTransition} initial="hidden" animate="show">
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
