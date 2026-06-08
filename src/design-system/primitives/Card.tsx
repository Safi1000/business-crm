import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds hover lift + pointer affordance for clickable cards. */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const pad = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, padding = 'md', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-line bg-surface shadow-sm',
        interactive &&
          'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md',
        pad[padding],
        className,
      )}
      {...rest}
    />
  );
});

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex items-center justify-between gap-3', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold text-content', className)} {...rest} />;
}
