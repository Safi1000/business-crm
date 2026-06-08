import type { Transition, Variants } from 'framer-motion';

/** Easing curves mirrored from tokens.css for framer-motion (cubic-bezier arrays). */
export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

export const duration = {
  fast: 0.16,
  base: 0.28,
  slow: 0.5,
};

export const springs = {
  /** Snappy UI spring for press/hover and modal entrances. */
  snappy: { type: 'spring', stiffness: 520, damping: 32, mass: 0.7 } satisfies Transition,
  /** Softer spring for drag / layout. */
  gentle: { type: 'spring', stiffness: 300, damping: 30 } satisfies Transition,
  /** Number count-up uses a duration tween, not a spring. */
} as const;

/* ---------- Reusable variants ---------- */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, y: -8, transition: { duration: duration.fast, ease: ease.out } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: springs.snappy },
  exit: { opacity: 0, scale: 0.97, transition: { duration: duration.fast, ease: ease.out } },
};

/** Container that staggers its children — used for table rows, KPI strips, grids. */
export const staggerContainer = (stagger = 0.045, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
};

/** Route transition — subtle slide + fade. */
export const routeTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.fast, ease: ease.out } },
};

/** Bottom-anchored bar (bulk actions / sticky modal footer) sliding up. */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: springs.snappy },
  exit: { opacity: 0, y: 24, transition: { duration: duration.fast, ease: ease.out } },
};

/** Right-anchored panel (notifications / AI assistant) sliding in. */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  show: { opacity: 1, x: 0, transition: springs.gentle },
  exit: { opacity: 0, x: '100%', transition: { duration: duration.base, ease: ease.out } },
};
