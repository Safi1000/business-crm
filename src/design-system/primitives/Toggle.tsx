import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springs } from '../tokens/motion';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled, size = 'md', className }: ToggleProps) {
  const dims = size === 'sm' ? { w: 'w-9', h: 'h-5', k: 18 } : { w: 'w-11', h: 'h-6', k: 22 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:ring-2',
        dims.w,
        dims.h,
        checked ? 'bg-brand-600' : 'bg-ink-300',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <motion.span
        layout
        transition={springs.snappy}
        className={cn('block rounded-full bg-white shadow-sm')}
        style={{
          width: dims.k - 4,
          height: dims.k - 4,
          marginLeft: checked ? `calc(100% - ${dims.k - 4}px)` : 0,
        }}
      />
    </button>
  );
}
