import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, Menu, X, User, KeyRound, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar } from '@ds/data-display';
import { DropdownMenu } from '@ds/overlays';
import { IconButton } from '@ds/primitives';
import { routeTransition } from '@ds/motion';

export interface PortalNavItem {
  label: string;
  to: string;
  end?: boolean;
}

interface PortalShellProps {
  brand: string;
  brandSub: string;
  greeting: string;
  navItems: PortalNavItem[];
  signOutTo: string;
}

/** Shared 2-zone top-nav layout for the Client and Employee portals (C1 / E1). */
export function PortalShell({ brand, brandSub, greeting, navItems, signOutTo }: PortalShellProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-display text-lg font-bold text-white">T</div>
            <div className="hidden sm:block">
              <p className="font-display text-sm font-bold leading-tight text-content">{brand}</p>
              <p className="text-2xs text-content-subtle">{brandSub}</p>
            </div>
          </div>

          <nav className="ml-4 hidden items-center gap-0.5 lg:flex">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40' : 'text-content-muted hover:bg-surface-sunken hover:text-content')
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-content-muted md:block">{greeting}</span>
            <IconButton icon={Bell} label="Notifications" />
            <DropdownMenu
              align="end"
              trigger={<button className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-surface-sunken"><Avatar name={greeting.replace(/^(Welcome,|Hi,|Welcome back,)\s*/i, '') || 'User'} size="sm" /><ChevronDown size={14} className="hidden text-content-subtle sm:block" /></button>}
              items={[
                { label: 'My Profile', icon: User },
                { label: 'Change Password', icon: KeyRound },
                'divider',
                { label: 'Sign Out', icon: LogOut, danger: true, onClick: () => { window.location.href = signOutTo; } },
              ]}
            />
            <IconButton icon={mobileOpen ? X : Menu} label="Menu" className="lg:hidden" onClick={() => setMobileOpen((o) => !o)} />
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line lg:hidden">
              <div className="flex flex-col gap-0.5 p-3">
                {navItems.map((n) => (
                  <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-brand-50 text-brand-700' : 'text-content-muted hover:bg-surface-sunken')}>
                    {n.label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={routeTransition} initial="hidden" animate="show" exit="exit">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
