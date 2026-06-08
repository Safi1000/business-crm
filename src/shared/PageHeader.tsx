import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Page-level actions (right side of the title bar). */
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  className?: string;
}

/** Title bar (A1.4): page title left, actions right; optional breadcrumb above. */
export function PageHeader({ title, description, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1 text-sm text-content-subtle">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.to ? (
                <Link to={c.to} className="hover:text-content">
                  {c.label}
                </Link>
              ) : (
                <span className="text-content-muted">{c.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight size={14} />}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-content">{title}</h1>
          {description && <p className="mt-1 text-sm text-content-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
