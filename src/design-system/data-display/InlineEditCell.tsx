import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/cn';

interface InlineEditCellProps {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  type?: 'text' | 'number';
  align?: 'left' | 'right';
  className?: string;
  /** Render fn for display mode (e.g. formatted currency). */
  display?: (value: string) => React.ReactNode;
}

/**
 * Click cell → input appears → Enter/blur saves → toast confirms (spec A1.5).
 * Esc cancels. The caller wires the toast in onSave.
 */
export function InlineEditCell({
  value,
  onSave,
  type = 'text',
  align = 'left',
  className,
  display,
}: InlineEditCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => setDraft(value), [value]);

  const commit = async () => {
    setEditing(false);
    if (draft !== value) await onSave(draft);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(
          'h-8 w-full rounded-md border border-brand-500 bg-surface px-2 text-sm text-content focus-visible:ring-2',
          align === 'right' && 'text-right',
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={cn(
        'group/cell -mx-2 inline-flex w-[calc(100%+1rem)] items-center gap-1.5 rounded-md px-2 py-1 text-left hover:bg-surface-sunken',
        align === 'right' && 'flex-row-reverse text-right',
        className,
      )}
    >
      <span className="truncate">{display ? display(value) : value}</span>
      <Pencil
        size={12}
        className="shrink-0 text-content-subtle opacity-0 transition-opacity group-hover/cell:opacity-100"
      />
    </button>
  );
}
