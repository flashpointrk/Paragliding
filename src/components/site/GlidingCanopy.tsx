'use client';

import * as React from 'react';
import {
  m,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { easeSmooth } from '@/lib/motion';

/** How many full left-right turns are made across the page. */
const TYPE_COUNT = 3;
/** Horizontal sway amplitude (px) — a narrow band that never disturbs the content. */
const SWAY_PX = 42;
/** Bank angle of the wing through the turns. */
const TILT_DEGREES = 15;
/** Vertical journey: from just below the fixed header to below the viewport. */
const START = '14vh';
const BITIS = '78vh';

/** Risers — from the canopy tips and its underside down to the pilot. */
const LINES = [
  'M4.6 22.6 30 41.5',
  'M59.4 22.6 34 41.5',
  'M20 20.4 31 41.5',
  'M44 20.4 33 41.5',
];

/**
 * Tandem wing glyph — canopy, risers and pilot.
 * Lucide has no paraglider icon, so this is inline SVG (like WhatsAppGlyph).
 *
 * The lines and the pilot are drawn twice: a white halo underneath and the dark
 * shape on top. That keeps it legible on both white sections and dark heroes.
 */
function CanopyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      {/* Canopy — a flattened paraglider wing with a scalloped trailing edge */}
      <path
        className="fill-brand-400"
        d="M3 21.6C3 11.4 15 5.2 32 5.2s29 6.2 29 16.4a4.83 3 0 0 1-9.67 0 4.83 3 0 0 1-9.67 0 4.83 3 0 0 1-9.67 0 4.83 3 0 0 1-9.66 0 4.83 3 0 0 1-9.67 0 4.83 3 0 0 1-9.67 0z"
      />
      {/* Risers */}
      <g fill="none" strokeLinecap="round">
        <g className="stroke-white/50" strokeWidth="3">
          {LINES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="stroke-navy-800/75" strokeWidth="1.3">
          {LINES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>
      {/* Pilot — head, seated torso and legs stretched forward.
          paintOrder="stroke": the white outline sits under the fill (the halo). */}
      <g
        className="fill-navy-800 stroke-white/50"
        strokeWidth="1.8"
        strokeLinecap="round"
        paintOrder="stroke"
      >
        <circle cx="32" cy="41" r="3" />
        <rect x="28.4" y="43.6" width="7.6" height="5.4" rx="2.2" />
        {/* Legs stretched forward — the outline is the white halo, so the fill shapes it */}
        <rect
          x="35.2"
          y="45"
          width="7.8"
          height="2.6"
          rx="1.3"
          transform="rotate(-12 35.2 46.3)"
        />
      </g>
    </svg>
  );
}

/**
 * Tandem canopy gliding down the page.
 *
 * - Vertical position follows scroll progress: it descends as you scroll.
 * - Horizontal position follows a sine curve → it spirals down, turning left
 *   and right.
 * - A heavily damped spring (stiffness 18 / damping 26) lags the scroll, so it
 *   never chases the viewport and instead drifts slowly.
 * - The wing banks into its turns (the bank angle is the derivative of the sway).
 * - Nothing renders at all when `prefers-reduced-motion` is set.
 * - Decorative: `aria-hidden` plus `pointer-events-none`.
 */
export function GlidingCanopy() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const progress = useSpring(scrollYProgress, {
    stiffness: 18,
    damping: 26,
    mass: 1.4,
    restDelta: 0.0005,
  });

  const y = useTransform(progress, [0, 1], [START, BITIS]);
  const x = useTransform(
    progress,
    (p) => Math.sin(p * TYPE_COUNT * Math.PI * 2) * SWAY_PX,
  );
  // The bank shares the sway's phase: level mid-band, banked at the extremes.
  const rotate = useTransform(
    progress,
    (p) => Math.sin(p * TYPE_COUNT * Math.PI * 2) * TILT_DEGREES,
  );

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      <m.div
        className="absolute left-[66%] top-0 sm:left-[80%]"
        style={{ x, y, rotate }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 1, duration: 1.4, ease: easeSmooth }}
      >
        {/* A thermal feel: it breathes gently even when the scroll stops */}
        <CanopyGlyph className="h-9 w-10 animate-float-slow drop-shadow-[0_6px_14px_rgba(11,31,58,0.22)] sm:h-11 sm:w-12" />
      </m.div>
    </div>
  );
}
