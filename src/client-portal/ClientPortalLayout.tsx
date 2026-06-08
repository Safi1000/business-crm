import { PortalShell, type PortalNavItem } from '@/layouts/PortalShell';
import { routes } from '@/config/routes';
import { useMyClient } from './hooks';

const NAV: PortalNavItem[] = [
  { label: 'Dashboard', to: routes.cpDashboard, end: true },
  { label: 'Invoices', to: routes.cpInvoices },
  { label: 'Statement', to: routes.cpStatement },
  { label: 'Projects', to: routes.cpProjects },
  { label: 'Contracts', to: routes.cpContracts },
  { label: 'Support', to: routes.cpSupport },
  { label: 'My Profile', to: routes.cpProfile },
];

export function ClientPortalLayout() {
  const { data: client } = useMyClient();
  return (
    <PortalShell
      brand="TECHXSERVE"
      brandSub="Client Portal"
      greeting={`Welcome, ${client?.name ?? 'Client'}`}
      navItems={NAV}
      signOutTo={routes.cpLogin}
    />
  );
}
