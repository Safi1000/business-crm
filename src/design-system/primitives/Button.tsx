import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-ink-900 text-white shadow-sm hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-400 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-white',
  outline:
    'border border-line-strong bg-surface text-content hover:bg-surface-sunken active:bg-ink-100 disabled:text-content-subtle',
  ghost: 'text-content-muted hover:bg-surface-sunken hover:text-content active:bg-ink-100',
  danger: 'bg-danger text-white shadow-sm hover:bg-danger-strong active:brightness-90',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 dark:bg-brand-950/40',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs rounded-md',
  md: 'h-10 gap-2 px-4 text-sm rounded-lg',
  lg: 'h-12 gap-2.5 px-6 text-[0.95rem] rounded-lg',
};

const iconSize: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  fullWidth?: boolean;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconRight: IconRight,
    fullWidth,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
        'transition-colors duration-150 focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size={iconSize[size]} />}
      {!loading && Icon && <Icon size={iconSize[size]} strokeWidth={2.2} />}
      {children}
      {!loading && IconRight && <IconRight size={iconSize[size]} strokeWidth={2.2} />}
    </motion.button>
  );
});
