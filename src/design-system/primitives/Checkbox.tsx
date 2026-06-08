import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  indeterminate?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate, className, checked, ...rest },
  ref,
) {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] shrink-0">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        className={cn(
          'peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[5px] border',
          'border-line-strong bg-surface transition-colors',
          'checked:border-brand-600 checked:bg-brand-600',
          'focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
          indeterminate && 'border-brand-600 bg-brand-600',
          className,
        )}
        {...rest}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">
        {indeterminate ? <Minus size={13} strokeWidth={3} /> : <Check size={13} strokeWidth={3} />}
      </span>
      {indeterminate && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white">
          <Minus size={13} strokeWidth={3} />
        </span>
      )}
    </span>
  );
});
