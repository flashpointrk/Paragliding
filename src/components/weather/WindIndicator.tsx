'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { Icon } from '@/components/ui/Icon';
import { directionLabel } from '@/lib/weather/suitability';

/**
 * Wind indicator — the "Open Sky" clean decision surface.
 *
 * The SVG compass is KEPT, but simplified:
 *  - The sector arc is a flat sky colour (it carries meaning: the acceptable
 *    direction range)
 *  - The wind arrow turns smoothly with `transition-transform` when the data
 *    changes (functional, so it stays)
 *  - The N/S/E/W letters use the display font
 *  - The centre dot is plain (no glow or pulse ring)
 *
 * `direction` is the direction the wind is blowing FROM (Open-Meteo
 * wind_direction_10m).
 */

export interface WindIndicatorProps {
  speed: number; // km/s (ortalama)
  direction: number; // derece (0-360)
  gust: number; // km/s
  /** Acceptable wind direction sector (inclusive), for the translucent arc. */
  sectorMin?: number | null;
  sectorMax?: number | null;
  /** Take-off heading (the reference arrow). */
  takeoffHeading?: number;
  className?: string;
}

/**
 * The SVG compass. The arrow points along `direction` (the direction the wind
 * blows from), with north always at the top.
 *
 * Angle conversion: meteorological direction has 0=N and 90=E, increasing
 * clockwise — the same rule as an SVG clockwise rotation.
 *
 * A CSS `transition-transform` on the arrow group gives it a smooth turn when
 * the data changes.
 */
function Compass({
  direction,
  sectorMin,
  sectorMax,
  locale,
  directionLetters,
  sz,
}: {
  direction: number;
  sectorMin?: number | null;
  sectorMax?: number | null;
  locale: 'tr' | 'en';
  directionLetters: { k: string; g: string; b: string; d: string };
  sz: Dictionary;
}) {
  const R = 48; // radius
  const centre = 56;

  // Sector arc path (flat colour — it carries the acceptable wind range).
  let sectorPath: React.ReactNode = null;

  if (sectorMin != null && sectorMax != null) {
    const a1 = ((sectorMin - 90) * Math.PI) / 180;
    const a2 = ((sectorMax - 90) * Math.PI) / 180;
    const x1 = centre + R * Math.cos(a1);
    const y1 = centre + R * Math.sin(a1);
    const x2 = centre + R * Math.cos(a2);
    const y2 = centre + R * Math.sin(a2);
    // large-arc-flag for the 360° wrap
    const arcAngle = (((sectorMax - sectorMin) % 360) + 360) % 360;
    const largeArc = arcAngle > 180 ? 1 : 0;
    sectorPath = (
      <path
        d={`M ${centre} ${centre} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
        fill="rgb(56 189 248 / 0.18)"
        stroke="rgb(56 189 248 / 0.6)"
        strokeWidth="1.5"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 112 112"
      role="img"
      aria-label={`${sz.weather.windDirectionLabel} ${Math.round(direction)} ${sz.weather.degrees} (${directionLabel(direction, locale)})`}
      className="h-32 w-32"
    >
      {/* Outer ring */}
      <circle
        cx={centre}
        cy={centre}
        r={R}
        fill="#ffffff"
        stroke="rgb(11 31 58 / 0.15)"
        strokeWidth="1.5"
      />
      {/* Thin inner ring */}
      <circle
        cx={centre}
        cy={centre}
        r={R - 4}
        fill="none"
        stroke="rgb(11 31 58 / 0.06)"
        strokeWidth="0.5"
      />

      {sectorPath}

      {/* Direction letters — display-font feel (bold weight) */}
      <text
        x={centre}
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fontFamily="var(--font-sora), system-ui, sans-serif"
        fill="#0B1F3A"
      >
        {directionLetters.k}
      </text>
      <text
        x={centre}
        y="106"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fontFamily="var(--font-sora), system-ui, sans-serif"
        fill="#0B1F3A"
      >
        {directionLetters.g}
      </text>
      <text
        x="9"
        y={centre + 3}
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fontFamily="var(--font-sora), system-ui, sans-serif"
        fill="#0B1F3A"
      >
        {directionLetters.b}
      </text>
      <text
        x="103"
        y={centre + 3}
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fontFamily="var(--font-sora), system-ui, sans-serif"
        fill="#0B1F3A"
      >
        {directionLetters.d}
      </text>

      {/* Thin diagonal rules */}
      <g stroke="rgb(11 31 58 / 0.1)" strokeWidth="0.5">
        <line x1={centre - R} y1={centre} x2={centre + R} y2={centre} />
        <line x1={centre} y1={centre - R} x2={centre} y2={centre + R} />
      </g>

      {/* Wind arrow — smooth rotation.
          The rotation is done purely with a CSS transform: combining the SVG
          `rotate(angle cx cy)` attribute with `transformOrigin` applied the
          centre twice and pushed the arrow outside the compass. */}
      <g
        style={{
          transform: `rotate(${direction}deg)`,
          transformOrigin: `${centre}px ${centre}px`,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* arrow body: from the centre upwards (N) → the direction rotates it */}
        <line
          x1={centre}
          y1={centre + 18}
          x2={centre}
          y2={centre - 28}
          stroke="#0EA5E9"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* arrow head (the way it is heading = up) */}
        <polygon
          points={`${centre},${centre - 34} ${centre - 6},${centre - 22} ${centre + 6},${centre - 22}`}
          fill="#0EA5E9"
        />
        {/* the source side (a small tail) */}
        <circle
          cx={centre}
          cy={centre + 18}
          r="3.5"
          fill="#0B1F3A"
        />
      </g>

      {/* Merkez nokta — sade */}
      <circle cx={centre} cy={centre} r="4" fill="#0B1F3A" />
    </svg>
  );
}

export function WindIndicator({
  speed,
  direction,
  gust,
  sectorMin,
  sectorMax,
  takeoffHeading,
  className,
}: WindIndicatorProps) {
  const { s: sz, locale } = useDictionary();
  const gustDelta = Math.max(0, gust - speed);

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-sand-200 bg-white p-5 shadow-soft',
        className
      )}
    >
      <div className="flex w-full items-center justify-between">
        <h4 className="flex items-center gap-1.5 font-display text-sm font-bold text-navy-900">
          <Icon name="Wind" className="h-4 w-4 text-sky-500" aria-hidden="true" />
          {sz.weather.wind}
        </h4>
        {takeoffHeading != null ? (
          <span className="text-xs font-medium text-navy-400">
            {sz.weather.takeoffHeading} {Math.round(takeoffHeading)}°
          </span>
        ) : null}
      </div>

      <Compass
        sz={sz}
        direction={direction}
        sectorMin={sectorMin}
        sectorMax={sectorMax}
        locale={locale}
        directionLetters={{
          k: directionLabel(0, locale),
          g: directionLabel(180, locale),
          b: directionLabel(270, locale),
          d: directionLabel(90, locale),
        }}
      />

      <dl className="grid w-full grid-cols-3 gap-2 text-center">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-navy-400">
            {sz.weather.direction}
          </dt>
          <dd className="font-display text-base font-bold text-navy-900">
            {Math.round(direction)}°
            <span className="ml-1 text-xs font-normal text-navy-500">
              {directionLabel(direction, locale)}
            </span>
          </dd>
        </div>
        <div className="border-x border-sand-200">
          <dt className="text-[11px] uppercase tracking-wide text-navy-400">
            {sz.weather.average}
          </dt>
          <dd className="font-display text-base font-bold text-navy-900">
            {Math.round(speed)}
            <span className="ml-0.5 text-xs font-normal text-navy-500">
              {sz.weather.speedUnit}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-navy-400">
            {sz.weather.gust}
          </dt>
          <dd className="font-display text-base font-bold text-navy-900">
            {Math.round(gust)}
            <span className="ml-0.5 text-xs font-normal text-navy-500">
              {sz.weather.speedUnit}
            </span>
          </dd>
        </div>
      </dl>

      <p className="w-full rounded-lg bg-sand-50 px-3 py-1.5 text-center text-[11px] text-navy-400">
        {sz.weather.gustDelta}:{' '}
        <strong className="font-semibold text-navy-700">
          {Math.round(gustDelta)} {sz.weather.speedUnit}
        </strong>
      </p>
    </div>
  );
}
