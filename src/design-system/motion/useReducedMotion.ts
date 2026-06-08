import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

/**
 * Single source of truth for motion gating across the app (brief: "gate motion
 * behind a single useReducedMotion hook"). Wraps framer-motion's detector so
 * components import from one place and we can override centrally later.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
