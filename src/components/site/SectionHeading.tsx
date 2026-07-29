'use client';

import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { revealVars, defaultTransition, viewportDefault } from '@/lib/motion';

export interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Small kicker above the heading — warm gold, used sparingly. */
  eyebrow?: string;
  align?: 'center' | 'left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-2xl sm:text-3xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-4xl sm:text-5xl',
} as const;

/**
 * Section heading — the "Open Sky" design language.
 *
 * - Flat ink heading (the Sora display font); NO gradient text.
 * - Optional eyebrow (small, uppercase, gold).
 * - A thin static gold rule (no animated underline).
 * - A single subtle fade-up reveal (respecting reduced motion).
 */
export function SectionHeading({
  title,
  description,
  eyebrow,
  align = 'center',
  size = 'md',
  className,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportDefault}
      variants={revealVars}
      transition={defaultTransition}
      className={cn(
        'flex flex-col gap-3',
        isCenter ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          {eyebrow}
        </span>
      ) : null}

      <h2
        className={cn(
          'font-display font-bold tracking-tight text-navy-900',
          sizeClasses[size]
        )}
      >
        {title}
      </h2>

      {/* Thin static gold rule */}
      <span
        aria-hidden="true"
        className={cn('h-0.5 w-12 rounded-full bg-brand-400', isCenter ? 'mx-auto' : '')}
      />

      {description ? (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed text-navy-500',
            isCenter ? 'mx-auto' : ''
          )}
        >
          {description}
        </p>
      ) : null}
    </m.div>
  );
}
