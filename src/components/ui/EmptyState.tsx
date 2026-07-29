import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from '@/components/ui/Icon';

export interface EmptyStateProps {
  /** Lucide icon name (Icon registry). */
  icon?: IconName;
  /** Heading (required). */
  title: string;
  /** Description text. */
  description?: string;
  /** Action area (a button and so on) — any ReactNode. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Shared empty-state component — a flat white card, a thin hairline and a
 * lucide icon.
 *
 * For empty lists, searches with no results and similar. Visually restrained:
 * not oversized, with the icon and heading carrying the focus.
 */
export function EmptyState({
  icon = 'Search',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-sand-200 bg-white px-6 py-12 text-center shadow-soft',
        className
      )}
      role="status"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sand-100 text-sky-600">
        <Icon name={icon} className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg font-semibold text-navy-900">
          {title}
        </h3>
        {description ? (
          <p className="max-w-md text-sm text-navy-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
