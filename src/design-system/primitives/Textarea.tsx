import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-content',
        'placeholder:text-content-subtle transition-colors focus-visible:ring-2',
        invalid
          ? 'border-danger focus-visible:ring-danger/50'
          : 'border-line-strong hover:border-ink-400 focus-visible:border-brand-500',
        className,
      )}
      {...rest}
    />
  );
});
