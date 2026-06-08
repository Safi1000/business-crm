import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  invalid?: boolean;
  placeholder?: string;
  sizeVariant?: 'sm' | 'md';
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, invalid, placeholder, sizeVariant = 'md', className, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full appearance-none rounded-lg border bg-surface pl-3 pr-9 text-content',
          'transition-colors focus-visible:ring-2',
          sizeVariant === 'sm' ? 'h-9 text-sm' : 'h-10 text-sm',
          invalid
            ? 'border-danger focus-visible:ring-danger/50'
            : 'border-line-strong hover:border-ink-400 focus-visible:border-brand-500',
          'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-content-subtle',
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-subtle"
      />
    </div>
  );
});
