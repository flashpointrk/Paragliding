'use client';

/**
 * Animated counter — the number climbs smoothly from zero to its target.
 *
 * Built on Framer Motion's useMotionValue, animate and useReducedMotion. With
 * prefers-reduced-motion enabled there is no animation and the target value
 * appears immediately.
 *
 * It updates textContent rather than only transform/opacity, but the animation
 * only runs while the counter is actually on screen.
 */

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  useReducedMotion,
  useInView,
} from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CountUpProps {
  target: number;
  /** Duration in seconds. Defaults to 1.2. */
  sure?: number;
  className?: string;
}

export function CountUp({
  target,
  sure = 1.2,
  className,
}: CountUpProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [shownCount, setShownCount] = useState(0);

  useEffect(() => {
    if (reduceMotion || !inView) {
      setShownCount(target);
      return;
    }

    if (!inView) return;

    const controls = animate(0, target, {
      duration: sure,
      ease: 'easeOut',
      onUpdate: (value) => {
        setShownCount(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [target, sure, inView, reduceMotion]);

  return (
    <span
      ref={ref}
      className={cn('tabular-nums', className)}
      aria-label={String(target)}
    >
      {shownCount}
    </span>
  );
}
