import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@ds/primitives';
import { KPICard, StatusBadge, statusTone } from '@ds/data-display';
import { LoginPage } from '@/layouts/AuthLayout';
import { formatMoney, dueStatus } from '@/lib/format';

describe('formatting utils', () => {
  it('formats PKR currency', () => {
    expect(formatMoney(450000, 'PKR')).toMatch(/450,000/);
  });
  it('derives overdue tone for past dates', () => {
    const past = new Date(Date.now() - 5 * 86_400_000).toISOString();
    expect(dueStatus(past).tone).toBe('danger');
  });
});

describe('status tone mapping', () => {
  it('maps known statuses', () => {
    expect(statusTone('Paid')).toBe('success');
    expect(statusTone('Overdue')).toBe('danger');
    expect(statusTone('Pending')).toBe('warning');
    expect(statusTone('Inactive')).toBe('neutral');
  });
});

describe('design system render', () => {
  it('renders a button', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders a status badge', () => {
    render(<StatusBadge status="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders a KPI card with formatted value', () => {
    render(<KPICard label="Total Invoiced" value="PKR 4,850,000" />);
    expect(screen.getByText('Total Invoiced')).toBeInTheDocument();
  });
});

describe('login page', () => {
  it('renders the sign-in form', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });
});
