import { useNavigate } from 'react-router-dom';
import { Plus, Landmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, Button } from '@ds/primitives';
import { ProgressBar } from '@ds/data-display';
import { EmptyState } from '@ds/feedback';
import { Stagger } from '@ds/motion';
import type { BankAccount } from '@/types';
import { useFormatMoney } from '@/shared';
import { routes } from '@/config/routes';

/** Bank Account Overview (A3 §C): balance bars relative to highest balance + total cash. */
export function BankOverview({ banks, totalCash }: { banks: BankAccount[]; totalCash: number }) {
  const navigate = useNavigate();
  const money = useFormatMoney();
  const max = Math.max(...banks.map((b) => b.balance), 1);

  return (
    <Card padding="md" className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Bank Accounts</CardTitle>
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => navigate(routes.banks)}>
          Add
        </Button>
      </CardHeader>

      {banks.length === 0 ? (
        <EmptyState
          icon={Landmark}
          size="sm"
          title="No bank accounts"
          description="Add a bank account to track balances."
          action={<Button size="sm" icon={Plus} onClick={() => navigate(routes.banks)}>Add Bank Account</Button>}
        />
      ) : (
        <>
          <Stagger className="flex-1 space-y-4">
            {banks.map((b) => (
              <Stagger.Item key={b.id}>
                <button
                  onClick={() => navigate(routes.banks)}
                  className="group w-full text-left"
                >
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-content group-hover:text-brand-600">
                      {b.name}
                    </span>
                    <span className="nums shrink-0 text-sm font-semibold text-content">
                      {money(b.balance)}
                    </span>
                  </div>
                  <ProgressBar value={(b.balance / max) * 100} tone={b.type === 'Treasury' ? 'success' : 'brand'} size="sm" />
                </button>
              </Stagger.Item>
            ))}
          </Stagger>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm font-medium text-content-muted">Total Cash Balance</span>
            <span className="nums text-lg font-bold text-content">{money(totalCash)}</span>
          </div>
        </>
      )}
    </Card>
  );
}
