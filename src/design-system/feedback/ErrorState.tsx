import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../primitives/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'inline';
  className?: string;
}

/** Inline retry on error (brief). Used per-section so one failure doesn't blank the page. */
export function ErrorState({
  title = 'Failed to load',
  message = 'Something went wrong while fetching this data.',
  onRetry,
  size = 'md',
  className,
}: ErrorStateProps) {
  if (size === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft/50 px-4 py-3 text-sm',
          className,
        )}
        role="alert"
      >
        <span className="flex items-center gap-2 font-medium text-danger-strong">
          <AlertTriangle size={16} /> {message}
        </span>
        {onRetry && (
          <Button size="sm" variant="outline" icon={RotateCw} onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-line bg-surface text-center',
        size === 'sm' ? 'px-6 py-10' : 'px-6 py-16',
        className,
      )}
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <AlertTriangle size={26} strokeWidth={2} />
      </div>
      <h3 className="text-base font-semibold text-content">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-content-muted">{message}</p>
      {onRetry && (
        <Button className="mt-5" variant="outline" icon={RotateCw} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
