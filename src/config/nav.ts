import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  FileSignature,
  FolderKanban,
  ListTodo,
  Clock,
  UserCog,
  CalendarCheck,
  Wallet,
  Plane,
  Boxes,
  ArrowLeftRight,
  Landmark,
  CreditCard,
  TrendingUp,
  PieChart,
  RefreshCcw,
  CalendarClock,
  FolderArchive,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { Phase } from './phases';
import { routes } from './routes';

/** Feature permission keys (match the toggles in Users & Permissions). */
export type Feature =
  | 'Clients' | 'Contracts' | 'Invoices' | 'Projects' | 'Tasks' | 'Workforce'
  | 'Payroll' | 'Attendance' | 'Finance' | 'Expenses' | 'Reports' | 'Compliance' | 'Admin';

export const FEATURES: Feature[] = ['Clients', 'Contracts', 'Invoices', 'Projects', 'Tasks', 'Workforce', 'Payroll', 'Attendance', 'Finance', 'Expenses', 'Reports', 'Compliance', 'Admin'];

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  phase: Phase;
  /** Feature this item requires. Undefined = always visible (e.g. Dashboard). */
  feature?: Feature;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

/** Drives the sidebar (A1.3). Phase badges flag future-update items. */
export const navGroups: NavGroup[] = [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', to: routes.dashboard, icon: LayoutDashboard, phase: 'P0' }],
  },
  {
    heading: 'Clients & Sales',
    items: [
      { label: 'Clients', to: routes.clients, icon: Users, phase: 'P0', feature: 'Clients' },
      { label: 'Contracts / Retainers', to: routes.contracts, icon: FileSignature, phase: 'P1', feature: 'Contracts' },
      { label: 'Invoices', to: routes.invoices, icon: Receipt, phase: 'P0', feature: 'Invoices' },
      { label: 'Quotes / Proposals', to: routes.quotes, icon: FileText, phase: 'P2', feature: 'Invoices' },
    ],
  },
  {
    heading: 'Work',
    items: [
      { label: 'Projects', to: routes.projects, icon: FolderKanban, phase: 'P1', feature: 'Projects' },
      { label: 'Tasks', to: routes.tasks, icon: ListTodo, phase: 'P0', feature: 'Tasks' },
      { label: 'Timesheets', to: routes.timesheets, icon: Clock, phase: 'P2', feature: 'Projects' },
    ],
  },
  {
    heading: 'Workforce',
    items: [
      { label: 'Employees', to: routes.employees, icon: UserCog, phase: 'P0', feature: 'Workforce' },
      { label: 'Attendance', to: routes.attendance, icon: CalendarCheck, phase: 'P0', feature: 'Attendance' },
      { label: 'Payroll', to: routes.payroll, icon: Wallet, phase: 'P0', feature: 'Payroll' },
      { label: 'Leaves & Advances', to: routes.leaves, icon: Plane, phase: 'P0', feature: 'Workforce' },
    ],
  },
  {
    heading: 'Inventory',
    items: [
      { label: 'Items & Stock', to: routes.items, icon: Boxes, phase: 'P1', feature: 'Finance' },
      { label: 'Stock Movements', to: routes.stockMovements, icon: ArrowLeftRight, phase: 'P1', feature: 'Finance' },
    ],
  },
  {
    heading: 'Finance',
    items: [
      { label: 'Banks & Ledgers', to: routes.banks, icon: Landmark, phase: 'P0', feature: 'Finance' },
      { label: 'Expenses', to: routes.expenses, icon: CreditCard, phase: 'P0', feature: 'Expenses' },
      { label: 'Cash Flow', to: routes.cashflow, icon: TrendingUp, phase: 'P0', feature: 'Finance' },
      { label: 'Financial Reports', to: routes.reports, icon: PieChart, phase: 'P0', feature: 'Reports' },
      { label: 'FX Rates', to: routes.fx, icon: RefreshCcw, phase: 'P1', feature: 'Finance' },
    ],
  },
  {
    heading: 'Compliance',
    items: [
      { label: 'Important Dates', to: routes.importantDates, icon: CalendarClock, phase: 'P0', feature: 'Compliance' },
      { label: 'Documents', to: routes.documents, icon: FolderArchive, phase: 'P0', feature: 'Compliance' },
    ],
  },
  {
    heading: 'Admin',
    items: [
      { label: 'Users & Permissions', to: routes.users, icon: ShieldCheck, phase: 'P0', feature: 'Admin' },
      { label: 'Settings', to: routes.settings, icon: Settings, phase: 'P0', feature: 'Admin' },
    ],
  },
];

export const miscIcons = { FileText, Clock };
