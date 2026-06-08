import { Hammer } from 'lucide-react';
import { PageHeader } from '@/shared';
import { EmptyState } from '@ds/feedback';
import type { Phase } from '@/config/phases';

/**
 * Temporary stand-in so every nav destination resolves while the Admin shell is
 * under review. Real page content replaces these per the P0 build order.
 */
export function PlaceholderPage({ title, phase = 'P0' }: { title: string; phase?: Phase }) {
  return (
    <div>
      <PageHeader title={title} description="Screen scaffold — content lands in the next milestone." />
      <EmptyState
        icon={Hammer}
        title={`${title} — coming up`}
        description={
          phase === 'P0'
            ? 'This P0 screen is queued right after the shell review. The shell, navigation, and design system around it are live.'
            : `Gated to ${phase}. The route is wired; full build follows P0.`
        }
      />
    </div>
  );
}
