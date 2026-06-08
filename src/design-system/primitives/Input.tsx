import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon;
  invalid?: boolean;
  affix?: ReactNode;
  sizeVariant?: 'sm' | 'md';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon: Icon, invalid, affix, sizeVariant = 'md', className, ...rest },
  ref,
) {
  return (
    <div className="relative flex items-center">
      {Icon && (
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 text-content-subtle"
          strokeWidth={2}
        />
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full rounded-lg border bg-surface text-content placeholder:text-content-subtle',
          'transition-colors focus-visible:ring-2',
          sizeVariant === 'sm' ? 'h-9 text-sm' : 'h-10 text-sm',
          Icon ? 'pl-9 pr-3' : 'px-3',
          affix ? 'pr-10' : '',
          invalid
            ? 'border-danger focus-visible:ring-danger/50'
            : 'border-line-strong hover:border-ink-400 focus-visible:border-brand-500',
          'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-content-subtle',
          className,
        )}
        {...rest}
      />
      {affix && <span className="absolute right-3 text-content-subtle">{affix}</span>}
    </div>
  );
});
