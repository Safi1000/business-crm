import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const sizes = {
  xs: 'h-6 w-6 text-2xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export type AvatarSize = keyof typeof sizes;

// Deterministic tint from the name so avatars are colorful but stable.
const tints = [
  'bg-brand-100 text-brand-700',
  'bg-info-soft text-info-strong',
  'bg-success-soft text-success-strong',
  'bg-warning-soft text-warning-strong',
  'bg-ink-200 text-ink-700',
];

function tintFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return tints[h % tints.length]!;
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
  status?: 'online' | 'away' | 'offline';
}

export function Avatar({ name, src, size = 'md', className, ring, status }: AvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizes[size], ring && 'ring-2 ring-surface')}
        />
      ) : (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full font-semibold',
            sizes[size],
            tintFor(name),
            ring && 'ring-2 ring-surface',
          )}
          aria-label={name}
          title={name}
        >
          {initials(name)}
        </span>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-surface',
            status === 'online' && 'bg-success',
            status === 'away' && 'bg-warning',
            status === 'offline' && 'bg-ink-400',
          )}
        />
      )}
    </span>
  );
}

interface AvatarStackProps {
  names: string[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarStack({ names, max = 4, size = 'sm', className }: AvatarStackProps) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {shown.map((n, i) => (
        <Avatar key={`${n}-${i}`} name={n} size={size} ring />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-surface-sunken font-semibold text-content-muted ring-2 ring-surface',
            sizes[size],
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
