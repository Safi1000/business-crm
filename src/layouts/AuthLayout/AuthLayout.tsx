import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/** Centered auth card on a branded, atmospheric backdrop. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4">
      {/* Layered brand backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-info/10 blur-3xl" />
        <div className="absolute inset-0 bg-dotgrid opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
}
