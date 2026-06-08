import { useMemo, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Checkbox } from '../primitives/Checkbox';
import { SkeletonTable } from '../feedback/Skeleton';
import { ErrorState } from '../feedback/ErrorState';
import { useReducedMotion } from '../motion/useReducedMotion';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  /** Sort accessor — return a comparable value. Enables column sorting. */
  sortAccessor?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  /** Rendered when not loading and data is empty. */
  empty?: ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  skeletonRows?: number;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading,
  error,
  onRetry,
  empty,
  selectable,
  selectedIds,
  onSelectionChange,
  onRowClick,
  sort,
  onSortChange,
  skeletonRows = 8,
  className,
}: DataTableProps<T>) {
  const reduced = useReducedMotion();
  const colCount = columns.length + (selectable ? 1 : 0);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortAccessor) return data;
    const acc = col.sortAccessor;
    return [...data].sort((a, b) => {
      const av = acc(a);
      const bv = acc(b);
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, sort, columns]);

  const allSelected = selectable && data.length > 0 && data.every((r) => selectedIds?.has(rowKey(r)));
  const someSelected = selectable && !allSelected && data.some((r) => selectedIds?.has(rowKey(r)));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(data.map(rowKey)));
  };
  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const handleSort = (col: Column<T>) => {
    if (!col.sortAccessor || !onSortChange) return;
    if (sort?.key === col.key) onSortChange({ key: col.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' });
    else onSortChange({ key: col.key, dir: 'asc' });
  };

  if (loading) return <SkeletonTable rows={skeletonRows} cols={colCount} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (data.length === 0 && empty) return <>{empty}</>;

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-surface', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-sunken/60">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={!!allSelected}
                    indeterminate={!!someSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      'px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wide text-content-subtle',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.sortAccessor && 'cursor-pointer select-none hover:text-content',
                      col.headerClassName,
                    )}
                    onClick={() => handleSort(col)}
                    aria-sort={isSorted ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-1',
                        col.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {col.header}
                      {col.sortAccessor &&
                        (isSorted ? (
                          sort!.dir === 'asc' ? (
                            <ChevronUp size={13} className="text-brand-600" />
                          ) : (
                            <ChevronDown size={13} className="text-brand-600" />
                          )
                        ) : (
                          <ChevronsUpDown size={13} className="opacity-40" />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <motion.tbody
            initial={reduced ? false : 'hidden'}
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.03 } } }}
          >
            <AnimatePresence initial={false}>
              {sorted.map((row) => {
                const id = rowKey(row);
                const selected = selectedIds?.has(id);
                return (
                  <motion.tr
                    key={id}
                    layout={!reduced}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'group border-b border-line last:border-0 transition-colors',
                      onRowClick && 'cursor-pointer',
                      selected ? 'bg-brand-50/60 dark:bg-brand-950/20' : 'hover:bg-surface-sunken/50',
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={!!selected}
                          onChange={() => toggleRow(id)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-content',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.cellClassName,
                        )}
                      >
                        {col.render ? col.render(row) : ((row as Record<string, ReactNode>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
