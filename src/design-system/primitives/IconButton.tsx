import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type IconButtonProps = Omit<HTMLMotionProps<'button'>, 'ref'> & {
  icon: LucideIcon;
  /** Required for a11y on icon-only controls. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  active?: boolean;
};

const box = { sm: 'h-8 w-8 rounded-md', md: 'h-9 w-9 rounded-lg', lg: 'h-10 w-10 rounded-lg' };
const px = { sm: 16, md: 18, lg: 20 };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = 'md', variant = 'ghost', active, className, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.12 }}
      className={cn(
        'inline-flex items-center justify-center text-content-muted transition-colors',
        'hover:text-content focus-visible:ring-2',
        variant === 'ghost' && 'hover:bg-surface-sunken',
        variant === 'outline' && 'border border-line-strong bg-surface hover:bg-surface-sunken',
        variant === 'solid' && 'bg-ink-900 text-white hover:bg-ink-800',
        active && 'bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700',
        box[size],
        className,
      )}
      {...rest}
    >
      <Icon size={px[size]} strokeWidth={2} />
    </motion.button>
  );
});
