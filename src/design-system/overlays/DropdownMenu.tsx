import type { ReactElement, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Popover } from './Popover';

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  /** Destructive styling (red) — Delete, Void, etc. */
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactElement;
  items: Array<MenuItem | 'divider'>;
  align?: 'start' | 'end';
  header?: ReactNode;
  className?: string;
}

/** Three-dot / quick-create style action menu. */
export function DropdownMenu({ trigger, items, align = 'end', header, className }: DropdownMenuProps) {
  return (
    <Popover trigger={trigger} align={align} className={cn('min-w-[200px] py-1.5', className)}>
      {(close) => (
        <div role="menu">
          {header && (
            <div className="border-b border-line px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-content-subtle">
              {header}
            </div>
          )}
          {items.map((item, i) =>
            item === 'divider' ? (
              <div key={`d${i}`} className="my-1 h-px bg-line" />
            ) : (
              <button
                key={item.label}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  close();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors disabled:opacity-40',
                  item.danger
                    ? 'text-danger hover:bg-danger-soft'
                    : 'text-content hover:bg-surface-sunken',
                )}
              >
                {item.icon && <item.icon size={16} strokeWidth={2} />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </Popover>
  );
}
