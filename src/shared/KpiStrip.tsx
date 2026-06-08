import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Stagger } from '@ds/motion';

/** Responsive KPI card row with staggered entrance (spec A1.4 KPI strip). */
export function KpiStrip({
  children,
  cols = 4,
  className,
}: {
  children: ReactNode;
  cols?: 3 | 4 | 5;
  className?: string;
}) {
  const colClass = {
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[cols];

  return (
    <Stagger className={cn('mb-6 grid grid-cols-1 gap-4', colClass, className)}>
      {Array.isArray(children) ? (
        children.map((child, i) => <Stagger.Item key={i}>{child}</Stagger.Item>)
      ) : (
        <Stagger.Item>{children}</Stagger.Item>
      )}
    </Stagger>
  );
}
