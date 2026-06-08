import type { ID } from './common';

export interface AppUser {
  id: ID;
  name: string;
  email: string;
  title: string;
  /** Empty array = "All (implicit)" super admin. */
  permissions: string[];
  role: 'Super Admin' | 'Manager' | 'Finance' | 'HR' | 'Ops';
}

export interface CompanyProfile {
  name: string;
  legalAddress: string;
  taxId: string;
  presentationCurrency: string;
  fiscalYearStart: string;
}
