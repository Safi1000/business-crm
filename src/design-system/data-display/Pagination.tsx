import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { Select } from '../primitives/Select';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

/** Pagination footer: rows-per-page, page nav, total record count (spec A4.1 D). */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 px-1 py-1', className)}>
      <div className="flex items-center gap-3 text-sm text-content-muted">
        <span>
          Showing <span className="nums font-medium text-content">{formatNumber(from)}</span>–
          <span className="nums font-medium text-content">{formatNumber(to)}</span> of{' '}
          <span className="nums font-medium text-content">{formatNumber(total)}</span>
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Rows</span>
            <Select
              sizeVariant="sm"
              className="w-[72px]"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted hover:bg-surface-sunken disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 text-sm text-content-muted">
          Page <span className="nums font-medium text-content">{page}</span> /{' '}
          <span className="nums">{pageCount}</span>
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-content-muted hover:bg-surface-sunken disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
