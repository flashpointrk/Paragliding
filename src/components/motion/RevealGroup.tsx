'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  staggerContainer,
  staggerFast,
  defaultTransition,
  viewportDefault,
} from '@/lib/motion';

export interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  /** Sequential delay between children. Defaults to 0.08. */
  stagger?: number;
  /** Should the animation play only once? Defaults to true. */
  once?: boolean;
}

/**
 * Stagger container — reveals its children in sequence.
 *
 * Important: the children must be motion elements carrying a `variants` prop
 * (e.g. <m.div variants={revealVars} /> or <Reveal />). This container
 * propagates `initial="hidden"` and `whileInView="visible"`.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  once = true,
}: RevealGroupProps) {
  const container =
    stagger <= 0.05
      ? staggerFast
      : {
          ...staggerContainer,
          visible: {
            ...staggerContainer.visible,
            transition: { staggerChildren: stagger },
          },
        };

  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewportDefault, once }}
      variants={container}
      transition={defaultTransition}
    >
      {children}
    </m.div>
  );
}
