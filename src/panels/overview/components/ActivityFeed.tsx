import {
  Receipt,
  Banknote,
  UserPlus,
  CalendarCheck,
  CreditCard,
  CheckSquare,
  Wallet,
  FileSignature,
  FolderArchive,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@ds/primitives';
import { Stagger } from '@ds/motion';
import { timeAgo } from '@/lib/format';
import type { ActivityEvent } from '@/types';

const ICONS: Record<ActivityEvent['type'], LucideIcon> = {
  invoice: Receipt,
  payment: Banknote,
  client: UserPlus,
  employee: CalendarCheck,
  expense: CreditCard,
  task: CheckSquare,
  payroll: Wallet,
  contract: FileSignature,
  document: FolderArchive,
};

const TONE: Record<ActivityEvent['type'], string> = {
  invoice: 'bg-info-soft text-info-strong',
  payment: 'bg-success-soft text-success-strong',
  client: 'bg-brand-50 text-brand-600',
  employee: 'bg-surface-sunken text-content-muted',
  expense: 'bg-warning-soft text-warning-strong',
  task: 'bg-info-soft text-info-strong',
  payroll: 'bg-success-soft text-success-strong',
  contract: 'bg-brand-50 text-brand-600',
  document: 'bg-surface-sunken text-content-muted',
};

/** Recent Activity feed (A3 §F): last events, click → originating record. */
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card padding="md" className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <Stagger className="flex-1 space-y-1">
        {events.slice(0, 10).map((e) => {
          const Icon = ICONS[e.type];
          return (
            <Stagger.Item key={e.id}>
              <button className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-sunken">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONE[e.type]}`}>
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-content">{e.description}</span>
                  <span className="mt-0.5 block text-2xs text-content-subtle">
                    {e.actor} · {timeAgo(e.at)}
                  </span>
                </span>
              </button>
            </Stagger.Item>
          );
        })}
      </Stagger>
    </Card>
  );
}
