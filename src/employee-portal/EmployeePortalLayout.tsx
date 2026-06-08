import { PortalShell, type PortalNavItem } from '@/layouts/PortalShell';
import { routes } from '@/config/routes';
import { useMe } from './hooks';

const NAV: PortalNavItem[] = [
  { label: 'My Dashboard', to: routes.epDashboard, end: true },
  { label: 'Attendance', to: routes.epAttendance },
  { label: 'Leaves', to: routes.epLeaves },
  { label: 'Payslips', to: routes.epPayslips },
  { label: 'Tasks', to: routes.epTasks },
  { label: 'Timesheets', to: routes.epTimesheets },
  { label: 'Expenses', to: routes.epExpenses },
  { label: 'Documents', to: routes.epDocuments },
  { label: 'My Profile', to: routes.epProfile },
];

export function EmployeePortalLayout() {
  const { data: me } = useMe();
  return (
    <PortalShell
      brand="TechxServe"
      brandSub="Employee Portal"
      greeting={`Hi, ${me?.name?.split(' ')[0] ?? 'there'}`}
      navItems={NAV}
      signOutTo={routes.epLogin}
    />
  );
}
