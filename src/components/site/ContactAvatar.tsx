import * as React from 'react';
import { cn } from '@/lib/utils';

export type Gender = 'man' | 'woman';

/**
 * Contact avatar — a plain silhouette.
 *
 * Lucide has no gendered silhouette, so this is inline SVG (the same approach
 * as WhatsAppGlyph). The feminine silhouette has a narrower shoulder line and a
 * hair outline; the masculine one has broader shoulders.
 */
function ManSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="14" r="7" fill="currentColor" />
      <path
        d="M6.5 35c0-6.6 6-11.5 13.5-11.5S33.5 28.4 33.5 35z"
        fill="currentColor"
      />
    </svg>
  );
}

function WomanSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Head */}
      <circle cx="20" cy="13.5" r="6.4" fill="currentColor" />
      {/* Hair falling to the shoulders — strands from either side of the head.
          It does not frame the face (which would read as a headscarf); it only
          extends past the silhouette and ends at shoulder height. */}
      <path
        d="M13.9 8.6c-2.6 1.9-3.6 5.1-3.4 9.6.1 2.4.5 4.6 1.1 6.6h3.3a20 20 0 0 1-1.1-5.1c-1.2-1.3-1.9-3-1.9-4.9 0-2.6 1-4.7 2-6.2z"
        fill="currentColor"
      />
      <path
        d="M26.1 8.6c2.6 1.9 3.6 5.1 3.4 9.6-.1 2.4-.5 4.6-1.1 6.6h-3.3a20 20 0 0 0 1.1-5.1c1.2-1.3 1.9-3 1.9-4.9 0-2.6-1-4.7-2-6.2z"
        fill="currentColor"
      />
      {/* Shoulders — narrower than the masculine variant */}
      <path
        d="M10.2 35c0-5.7 4.4-9.6 9.8-9.6s9.8 3.9 9.8 9.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface ContactAvatarProps {
  /**
   * Which silhouette to draw. Without it the person's initial is shown instead,
   * so no gender is assumed when the configuration does not state one.
   */
  gender?: Gender;
  /** The person's name, for accessibility (the visible label sits alongside). */
  name?: string;
  /** Screen-reader role label, localized (e.g. "Contact"). */
  roleLabel?: string;
  /**
   * Is it sitting on a dark surface (the footer, say)?
   * The colours cannot be overridden through `className` — `cn` does not
   * tailwind-merge — so the surface and icon colours are chosen by prop.
   */
  dark?: boolean;
  className?: string;
}

export function ContactAvatar({
  gender,
  name,
  roleLabel = 'Adviser',
  dark = false,
  className,
}: ContactAvatarProps) {
  const Silhouette =
    gender === 'woman' ? WomanSilhouette : gender === 'man' ? ManSilhouette : null;
  const initial = name?.trim().charAt(0).toLocaleUpperCase('tr-TR') ?? '';
  return (
    <span
      className={cn(
        'flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-full',
        dark
          ? 'bg-white/15 text-white ring-1 ring-white/20'
          : 'bg-sky-50 text-sky-700',
        className
      )}
      role="img"
      aria-label={name ? `${name} — ${roleLabel}` : roleLabel}
    >
      {Silhouette ? (
        <Silhouette className="h-full w-full translate-y-[1px]" />
      ) : (
        <span aria-hidden className="text-sm font-semibold">
          {initial}
        </span>
      )}
    </span>
  );
}
