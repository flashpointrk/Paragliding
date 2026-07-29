import { SITE } from '@/lib/site';

/**
 * The brand mark, drawn inline rather than loaded from a file.
 *
 * Keeping it in code rather than in `public/images` buys three things: the
 * wordmark is real text, so it follows `NEXT_PUBLIC_SITE_NAME` instead of being
 * baked into a bitmap; the ink follows `currentColor`, so one component covers
 * both light and dark grounds without a second asset; and it stays sharp at any
 * size with no image request.
 *
 * The canopy geometry comes from two quadratics — an outer curve and an inner
 * one — so the cell dividers and the risers land exactly on the wing rather
 * than being positioned by eye.
 */

/** Cell dividers: [x, outer y, inner y]. */
const CELLS: [number, number, number][] = [
  [28.8, 44.88, 58.32],
  [44.4, 35.97, 55.08],
  [60.0, 33.0, 54.0],
  [75.6, 35.97, 55.08],
  [91.2, 44.88, 58.32],
];

/** Risers: [x, y] on the inner curve, all converging on the harness. */
const RISERS: [number, number][] = [
  [20.5, 60.93],
  [39.2, 55.92],
  [60.0, 54.0],
  [80.8, 55.92],
  [99.5, 60.93],
];

type GlyphProps = { className?: string };

/** The wing on its own — for square slots such as the sidebar or a medallion. */
export function BrandGlyph({ className }: GlyphProps) {
  return (
    <svg
      viewBox="6 31 108 79"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 66 Q60 0 112 66 Q60 42 8 66 Z" fill="#FFBB00" />
      {CELLS.map(([x, outer, inner]) => (
        <line key={x} x1={x} y1={outer} x2={x} y2={inner} stroke="#E09400" strokeWidth={1.6} />
      ))}
      {RISERS.map(([x, y]) => (
        <line
          key={x}
          x1={x}
          y1={y}
          x2={60}
          y2={97}
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      ))}
      <rect x={51} y={95} width={18} height={13} rx={5.5} fill="#00E1FC" />
    </svg>
  );
}

type BrandMarkProps = {
  /** Wraps the glyph and the wordmark. Set the ink here, e.g. `text-white`. */
  className?: string;
  glyphClassName?: string;
  wordmarkClassName?: string;
};

/** The full lockup: the wing plus the configured site name. */
export function BrandMark({ className, glyphClassName, wordmarkClassName }: BrandMarkProps) {
  return (
    <span className={className}>
      <BrandGlyph className={glyphClassName} />
      <span className={wordmarkClassName}>{SITE.shortName || SITE.name}</span>
    </span>
  );
}
