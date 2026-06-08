import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@ds/primitives';

interface FilterBarProps {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Filter controls (selects, date pickers) rendered after search. */
  children?: ReactNode;
  activeCount?: number;
  onReset?: () => void;
  /** Right-aligned content (e.g. view toggle). */
  trailing?: ReactNode;
  className?: string;
}

/** Filter bar (A1.4) — search + filters + reset. URL persistence is wired by the page. */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  children,
  activeCount = 0,
  onReset,
  trailing,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-center gap-2.5', className)}>
      {onSearchChange && (
        <div className="min-w-[200px] flex-1 sm:max-w-xs">
          <Input
            icon={Search}
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            sizeVariant="sm"
          />
        </div>
      )}
      {children}
      {activeCount > 0 && onReset && (
        <button
          onClick={onReset}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
        >
          <X size={15} /> Reset
          <span className="rounded-full bg-brand-100 px-1.5 text-2xs">{activeCount}</span>
        </button>
      )}
      {trailing && <div className="ml-auto flex items-center gap-2">{trailing}</div>}
    </div>
  );
}
