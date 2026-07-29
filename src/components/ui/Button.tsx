import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  // Backwards compatibility (older call sites). In the "Open Sky" language
  // gradient → primary (warm gold), glow → secondary (navy).
  | 'gradient'
  | 'glow';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

const variants: Record<Variant, string> = {
  // The single warm CTA — logo yellow (brand-400) with dark text (contrast 11.1)
  primary: 'bg-brand-400 text-navy-950 hover:bg-brand-500 shadow-soft',
  // Lacivert dolgu
  secondary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-soft',
  // Hairline outline, neutral
  outline:
    'border border-navy-200 bg-transparent text-navy-800 hover:bg-navy-50 hover:border-navy-300',
  ghost: 'bg-transparent text-navy-700 hover:bg-navy-50 active:bg-navy-100',
  // Deprecated aliases → mapped onto the new language
  gradient: 'bg-brand-400 text-navy-950 hover:bg-brand-500 shadow-soft',
  glow: 'bg-navy-900 text-white hover:bg-navy-800 shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Loading state — shows a spinner and blocks clicks. */
  isLoading?: boolean;
}

/**
 * Base button component — the "Open Sky" design language.
 *
 * Plain and editorial, in a pill (rounded-full) shape, with a single warm CTA
 * (primary). No Framer Motion, scale or glow — just a colour transition.
 *
 * Variants: primary (gold CTA), secondary (navy), outline, ghost.
 * gradient/glow are kept for older call sites and mapped onto the new language.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, children, disabled, type, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
