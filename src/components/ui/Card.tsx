import * as React from 'react';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'muted' | 'glass' | 'gradient' | 'glow';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  /** Visual variant. Defaults to 'default'. */
  variant?: CardVariant;
  /** Slight lift plus shadow on hover. Defaults to false. */
  interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  // Flat white card with a hairline border
  default: 'border-sand-200 bg-white shadow-soft',
  // Warm neutral surface (for unemphasised blocks)
  muted: 'border-sand-200 bg-sand-50',
  // Deprecated aliases — mapped onto the flat surface in "Open Sky"
  glass: 'border-sand-200 bg-white shadow-soft',
  gradient: 'border-sand-200 bg-sand-50',
  glow: 'border-sand-200 bg-white shadow-soft',
};

/**
 * Base card component — the "Open Sky" design language.
 *
 * A flat white surface with a thin hairline border and a soft shadow. No glass,
 * glow or mesh. `interactive` adds a very slight lift on hover
 * (-translate-y-0.5) plus a shadow.
 *
 * The glass/gradient/glow variants are kept for older call sites and mapped
 * onto the flat surface.
 */
export function Card({
  className,
  as: Tag = 'div',
  variant = 'default',
  interactive = false,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border transition-[transform,box-shadow,border-color] duration-300 ease-smooth',
        variantClasses[variant],
        interactive &&
          'hover:-translate-y-0.5 hover:border-sand-300 hover:shadow-soft-lg',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-5 border-b border-sand-200', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-navy-900 tracking-tight',
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-5 border-t border-sand-200', className)}
      {...props}
    />
  );
}
