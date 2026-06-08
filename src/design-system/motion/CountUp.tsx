import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

interface CountUpProps {
  value: number;
  /** Formatter applied to the animated value (currency, percent, plain). */
  format?: (n: number) => string;
  durationMs?: number;
  className?: string;
}

/**
 * KPI numbers count up on mount and re-animate when `value` changes (brief:
 * "KPI card numbers count up on mount/refresh"). Respects reduced-motion.
 */
export function CountUp({ value, format = (n) => String(Math.round(n)), durationMs = 900, className }: CountUpProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const prev = useRef(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: durationMs / 1000,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => {
        prev.current = value;
      },
    });
    return () => controls.stop();
  }, [value, durationMs, reduced]);

  return (
    <span className={className} aria-label={format(value)}>
      {format(display)}
    </span>
  );
}
