'use client';

import {
  LazyMotion,
  MotionConfig,
  domAnimation,
} from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Framer Motion LazyMotion + MotionConfig provider.
 *
 * The `domAnimation` feature set covers animation and gestures, but not drag.
 * Every `m.*` component (Reveal, Parallax and friends) runs inside this
 * provider. Bundle friendly: the full motion library loads lazily (DOM
 * animation is roughly 5kb).
 *
 * `MotionConfig reducedMotion="user"` respects the operating-system setting, so
 * animations simplify automatically when prefers-reduced-motion is on.
 *
 * `LazyMotion strict` forces `m.*` over `motion.*`, keeping the bundle in check
 * by preventing an accidental full-motion import.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.5 }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
