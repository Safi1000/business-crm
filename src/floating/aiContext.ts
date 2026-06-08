import { routes } from '@/config/routes';

export interface AIContext {
  subtitle: string;
  prompts: string[];
}

/** Page-aware assistant behaviour (spec A11.1). Matched by path prefix. */
const MAP: Array<{ match: string; ctx: AIContext }> = [
  {
    match: routes.invoices,
    ctx: {
      subtitle: 'Helping you with Invoices',
      prompts: ['Which clients are overdue?', "Generate this month's recurring invoices.", 'What is my total outstanding?'],
    },
  },
  {
    match: routes.payroll,
    ctx: {
      subtitle: 'Helping you with Payroll',
      prompts: ['How was payroll vs last month?', 'Who has the highest pending advance?', 'Total net disbursed this month?'],
    },
  },
  {
    match: routes.importantDates,
    ctx: {
      subtitle: 'Helping you with Compliance',
      prompts: ['What expires this month?', 'Show licences expiring in 30 days.', 'Any critical deadlines overdue?'],
    },
  },
  {
    match: routes.clients,
    ctx: { subtitle: 'Helping you with Clients', prompts: ['Who are my top clients by revenue?', 'Which clients have no active contract?', 'Add a new client.'] },
  },
  {
    match: routes.employees,
    ctx: { subtitle: 'Helping you with Workforce', prompts: ['Who is on leave today?', 'List employees with missing documents.', 'How many active employees?'] },
  },
  {
    match: routes.expenses,
    ctx: { subtitle: 'Helping you with Expenses', prompts: ['What is my biggest expense category?', 'Total expenses this month?', 'Add an expense.'] },
  },
  {
    match: routes.tasks,
    ctx: { subtitle: 'Helping you with Tasks', prompts: ['What is due this week?', 'Show urgent tasks.', 'Create a task.'] },
  },
];

const DEFAULT: AIContext = {
  subtitle: 'Ask me anything about your business',
  prompts: ['Summarise my business this month.', 'What needs my attention today?', 'How is cash flow looking?'],
};

export function aiContextFor(pathname: string): AIContext {
  // longest-prefix match, dashboard handled by default
  const hit = MAP.filter((m) => pathname.startsWith(m.match)).sort((a, b) => b.match.length - a.match.length)[0];
  return hit?.ctx ?? DEFAULT;
}

/** Canned reply generator — no real LLM in this build. */
export function mockReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('overdue')) return 'You have 1 overdue invoice (INV-0007 to Crescent Steel, 12 days overdue) totalling ~PKR 230K. Want me to draft a reminder email?';
  if (p.includes('payroll')) return 'June payroll is ~PKR 2.31M across 21 employees — about 4% higher than May, driven by two new hires and bonuses. 7 payslips are still pending disbursement.';
  if (p.includes('expire') || p.includes('licence') || p.includes('deadline')) return 'This month: Sales Tax Return Filing (in 4 days, Critical) and EOBI Contribution (in 8 days, High). PSEB Registration is already 3 days overdue.';
  if (p.includes('top client')) return 'Your top clients by revenue this period are Indus Textiles, Sapphire Retail and Crescent Steel. Indus alone accounts for ~22% of invoiced value.';
  if (p.includes('leave')) return '2 employees are on leave today. 4 leave requests are pending your approval.';
  if (p.includes('cash')) return 'Net available cash is healthy at ~PKR 8.9M across 4 accounts. Revenue is trending up ~12% over the last quarter while expenses are flat.';
  return "Here's a quick take based on your current data. (This is a demo assistant — wire it to your LLM of choice to make it live.)";
}
