'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { SuitabilityStatus } from '@/lib/weather/suitability';
import { statusLabel } from '@/lib/weather/suitability';

/**
 * Flight suitability badge — the "Open Sky" clean decision surface.
 *
 * Accessibility is preserved: colour, text and icon encode the same thing,
 * with `role="img"` and an `aria-label`. The status colours (green/amber/red)
 * stay because they carry meaning, rendered through the plain `Badge`
 * component with no glow or pulse.
 */

interface Styles {
  /** Badge variant. */
  variant: BadgeVariant;
  /** Lucide icon name (Icon registry). */
  icon: 'Check' | 'AlertTriangle' | 'X';
  /** Long form, for aria labels. */
  fullTextKey: string;
}

const STYLES: Record<SuitabilityStatus, Styles> = {
  green: {
    variant: 'green',
    icon: 'Check',
    fullTextKey: 'rozetUygun',
  },
  amber: {
    variant: 'yellow',
    icon: 'AlertTriangle',
    fullTextKey: 'rozetDikkat',
  },
  red: {
    variant: 'red',
    icon: 'X',
    fullTextKey: 'rozetElverissiz',
  },
};

export interface SuitabilityBadgeProps {
  status: SuitabilityStatus;
  /** Compact (dot plus short text) or full (icon plus text)? */
  size?: 'sm' | 'md' | 'lg';
  /** Show the stale-data warning badge (an amber "Out of date"). */
  stale?: boolean;
  /** Accepted for backwards compatibility; the "Open Sky" language uses no pulse animation. */
  pulse?: boolean;
  className?: string;
}

export function SuitabilityBadge({
  status,
  size = 'md',
  stale = false,
  className,
}: SuitabilityBadgeProps) {
  const { s: sz, locale } = useDictionary();
  const s = STYLES[status];
  const text = statusLabel(status, locale);
  const fullTextKey = sz.weather[s.fullTextKey as 'rozetUygun'];
  const ariaText = stale
    ? `${fullTextKey} — ${sz.weather.staleBadgeSuffix}`
    : fullTextKey;

  const magnitude =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs gap-1.5'
      : size === 'lg'
        ? 'px-4 py-2 text-base gap-2.5'
        : 'px-3 py-1.5 text-sm gap-2';

  const iconSize =
    size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  // Icon artwork: lucide-style inline SVG (with a type-safe union).
  // Kept inline to avoid tangled import cycles.
  const IconStroke = (props: React.SVGProps<SVGSVGElement>) => {
    const paths: Record<Styles['icon'], React.ReactNode> = {
      Check: <polyline points="20 6 9 17 4 12" />,
      AlertTriangle: (
        <>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      ),
      X: (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ),
    };
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths[s.icon]}
      </svg>
    );
  };

  const dotSize =
    size === 'sm' ? 'h-1.5 w-1.5' : size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2';

  return (
    <Badge
      variant={s.variant}
      role="img"
      aria-label={ariaText}
      className={cn('font-semibold', magnitude, className)}
    >
      <IconStroke className={cn('shrink-0', iconSize)} />
      <span>{text}</span>
      {stale ? (
        <span
          aria-hidden="true"
          title={sz.weather.currentDataUnavailable}
          className={cn('rounded-full bg-yellow-500', dotSize)}
        />
      ) : null}
    </Badge>
  );
}
