import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/motion/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';

export interface CtaAction {
  label: string;
  href: string;
  /** Eylem ikonu (opsiyonel). */
  icon?: IconName;
}

export interface CtaSectionProps {
  title: string;
  description: string;
  primaryAction: CtaAction;
  secondaryAction?: CtaAction;
  /** Visual variant. Defaults to 'navy'. The old 'sunset'/'mesh' map to 'navy'. */
  variant?: 'navy' | 'sunset' | 'mesh';
  /** Optional background photograph (with a navy scrim). */
  backgroundImage?: string;
  className?: string;
}

/**
 * Reusable CTA band — the "Open Sky" design language.
 *
 * A single plain navy band (optionally a photograph plus scrim). No glow orbs,
 * glass cards or gradient buttons. The primary action is one warm gold pill;
 * the secondary is a thin outlined light button.
 */
export function CtaSection({
  title,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  className,
}: CtaSectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden text-white',
        // Without a photograph a flat navy-900 would match the footer beneath it and
        // the two would merge; the gradient keeps the band distinct.
        backgroundImage ? 'bg-navy-900' : 'bg-navy-gradient',
        className
      )}
    >
      {/* Optional background photograph */}
      {backgroundImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          {/* Readability scrim — light and bottom-weighted, so the photo stays vivid */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/45 to-navy-950/20"
            aria-hidden="true"
          />
        </>
      ) : null}

      <Reveal className="container relative py-20 sm:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-sand-200">
            {description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={primaryAction.href}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-400 px-8 text-base font-semibold text-navy-950 shadow-soft transition-colors duration-200 ease-smooth hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              {primaryAction.label}
              {primaryAction.icon ? (
                <Icon name={primaryAction.icon} className="h-5 w-5" aria-hidden="true" />
              ) : null}
            </Link>
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-base font-semibold text-white transition-colors duration-200 ease-smooth hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                {secondaryAction.icon ? (
                  <Icon name={secondaryAction.icon} className="h-5 w-5" aria-hidden="true" />
                ) : null}
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
