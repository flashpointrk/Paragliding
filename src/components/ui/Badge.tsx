import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'sunset';

const variants: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800 ring-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  red: 'bg-red-100 text-red-800 ring-red-200',
  gray: 'bg-navy-50 text-navy-700 ring-navy-200',
  // For the postponed status
  blue: 'bg-sky-100 text-sky-800 ring-sky-200',
  // Sunset accent
  sunset: 'bg-sunset-100 text-sunset-800 ring-sunset-300',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /**
   * Shows a thin, static emphasis ring for live or pending states.
   */
  pulse?: boolean;
}

/**
 * Small label / badge.
 *
 * Variants: green, yellow, red, gray, blue, sunset.
 * `pulse` → a plain, static emphasis ring for live or pending states.
 */
export function Badge({
  className,
  variant = 'gray',
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className="relative inline-flex">
      {/* Static emphasis ring — no motion, kept plain */}
      {pulse ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 rounded-full ring-2 ring-inset opacity-70',
            variants[variant]
          )}
        />
      ) : null}
      <span
        className={cn(
          'relative inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    </span>
  );
}
