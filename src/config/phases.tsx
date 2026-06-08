import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { EmptyState } from '@ds/feedback';

export type Phase = 'P0' | 'P1' | 'P2' | 'P3';

/** Which phases are currently "shipped" and viewable. P0 is the MVP. */
export const ACTIVE_PHASES: Phase[] = ['P0', 'P1', 'P2', 'P3'];

export function isPhaseActive(phase: Phase): boolean {
  return ACTIVE_PHASES.includes(phase);
}

const PHASE_LABEL: Record<Phase, string> = {
  P0: 'MVP',
  P1: 'Phase 1',
  P2: 'Phase 2',
  P3: 'Phase 3',
};

/**
 * Gates a screen behind its build phase. P0 renders children; later phases show
 * a "coming in <phase>" placeholder so the route exists but isn't half-built.
 */
export function PhaseGate({ phase, children }: { phase: Phase; children: ReactNode }) {
  if (isPhaseActive(phase)) return <>{children}</>;
  return (
    <div className="mx-auto max-w-xl py-12">
      <EmptyState
        icon={Lock}
        title={`Shipping in ${PHASE_LABEL[phase]}`}
        description={`This screen is part of ${PHASE_LABEL[phase]} of the rollout. The route is wired and gated; full functionality lands in a future update.`}
      />
    </div>
  );
}

export function PhaseBadge({ phase }: { phase: Phase }) {
  if (phase === 'P0') return null;
  return (
    <span className="ml-auto rounded bg-surface-sunken px-1.5 py-0.5 text-2xs font-semibold text-content-subtle">
      {phase}
    </span>
  );
}
