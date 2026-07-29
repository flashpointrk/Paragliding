/**
 * Framer Motion plumbing — the source of truth for the design system.
 *
 * Every animation variant, easing function and viewport setting comes from
 * here. One source keeps them consistent.
 *
 * Note: Framer Motion respects prefers-reduced-motion out of the box (the
 * useReducedMotion hook plus MotionConfig.reducedMotion="user"), and
 * globals.css additionally disables every CSS animation.
 */
import type { Transition, Variants } from 'framer-motion';

/* ---------- Easing constants (aligned with Tailwind) ---------- */
export const easeSmooth = [0.4, 0, 0.2, 1] as const;
export const easeSpring = [0.34, 1.56, 0.64, 1] as const;

/* ---------- Default transition ---------- */
export const defaultTransition: Transition = {
  duration: 0.5,
  ease: easeSmooth,
};

/* ---------- Individual variants ---------- */

/** The base fade-up used for scroll reveals */
export const revealVars: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Entrance with a slight scale (modals, hero elements) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
};

/** Slide in from the left */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0 },
};

/** Slide in from the right */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0 },
};

/* ---------- Stagger containers ---------- */

/**
 * Container that reveals its children in sequence.
 * staggerChildren: 0.08 (the default, nicely balanced).
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

/** Faster stagger (for dense grids). */
export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

/* ---------- Viewport settings ---------- */

/**
 * Default viewport configuration for whileInView.
 * once: true → the animation plays a single time (better for performance, and
 * it does not nag on every pass).
 * amount: 0.2 → triggers once 20% of the element is visible.
 */
export const viewportDefault = {
  once: true,
  amount: 0.2,
} as const;
