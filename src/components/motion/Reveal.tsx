'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  revealVars,
  defaultTransition,
  viewportDefault,
} from '@/lib/motion';

export interface RevealProps {
  children: ReactNode;
  /** Delay in seconds — for sequenced reveals. */
  delay?: number;
  /** Y-axis distance (px). Defaults to 24. */
  y?: number;
  className?: string;
  /** Should the animation play only once? Defaults to true. */
  once?: boolean;
}

/**
 * Scroll-reveal component — fades up as it enters the viewport.
 * Bundle friendly, using Framer Motion's `m` with LazyMotion.
 * Framer Motion respects prefers-reduced-motion natively.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}: RevealProps) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewportDefault, once }}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ ...defaultTransition, delay }}
    >
      {children}
    </m.div>
  );
}

// Re-exported so `revealVars` is available without a second import
export { revealVars };
