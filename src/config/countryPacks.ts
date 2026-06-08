/**
 * Country packs keep statutory/compliance fields as data, not code (brief).
 * P0 ships Pakistan; other countries are added here without touching forms.
 */

export interface StatutoryField {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'select';
  options?: string[];
}

export interface CountryPack {
  code: string;
  country: string;
  /** Label for the primary business tax id (varies by country). */
  taxIdLabel: string;
  /** Extra client tax/compliance fields. */
  clientFields: StatutoryField[];
  /** Employee statutory id fields. */
  employeeFields: StatutoryField[];
}

export const countryPacks: Record<string, CountryPack> = {
  Pakistan: {
    code: 'PK',
    country: 'Pakistan',
    taxIdLabel: 'NTN',
    clientFields: [
      { name: 'strn', label: 'STRN', placeholder: '32-77-XXXX-XXX-XX' },
      { name: 'filerStatus', label: 'Filer Status', type: 'select', options: ['Filer', 'Non-Filer'] },
    ],
    employeeFields: [
      { name: 'cnic', label: 'CNIC', placeholder: '42101-1234567-1' },
      { name: 'eobiNo', label: 'EOBI Reg No.', placeholder: 'EOBI-XXXXXX' },
    ],
  },
};

export const defaultCountry = 'Pakistan';
export const getCountryPack = (country: string): CountryPack =>
  countryPacks[country] ?? countryPacks[defaultCountry]!;
