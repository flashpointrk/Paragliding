'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { formatHour } from '@/lib/i18n/format';
import { Icon } from '@/components/ui/Icon';

/**
 * Sunrise and sunset information — the "Open Sky" clean decision surface.
 *
 * A flat card with a thin day bar in neutral sky/sand tones:
 * night→sunrise→day→sunset→night. Sunrise and sunset use the lucide
 * Sunrise/Sunset icons with the times in the display font, and the day length
 * stays subtle.
 */

export interface SunInfoProps {
  sunrise: string; // ISO
  batis: string; // ISO
  className?: string;
}



/** Day length between sunrise and sunset (hours:minutes). */
function dayLength(
  sunriseIso: string,
  batisIso: string,
  hourShort: string,
  minuteShort: string
): string {
  try {
    const d = new Date(sunriseIso).getTime();
    const b = new Date(batisIso).getTime();
    if (!Number.isFinite(d) || !Number.isFinite(b) || b <= d) return '—';
    const deltaSeconds = Math.round((b - d) / 1000);
    const hour = Math.floor(deltaSeconds / 3600);
    const dak = Math.floor((deltaSeconds % 3600) / 60);
    return `${hour} ${hourShort} ${dak} ${minuteShort}`;
  } catch {
    return '—';
  }
}

export function SunInfo({ sunrise, batis, className }: SunInfoProps) {
  const { s: sz, locale } = useDictionary();
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Sunrise */}
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-200 bg-sand-50"
        >
          <Icon
            name="Sunrise"
            className="h-6 w-6 text-sky-600"
            aria-hidden="true"
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500">
            {sz.weather.sunrise}
          </p>
          <p className="font-display text-xl font-bold text-navy-900">
            {formatHour(locale, sunrise)}
          </p>
        </div>
      </div>

      {/* Day bar — night→sunrise→day→sunset→night (the gradient carries meaning) */}
      <div className="hidden flex-1 sm:block">
        <div
          className="relative h-2 w-full rounded-full"
          style={{
            background:
              'linear-gradient(to right, #0B1F3A 0%, #7DD3FC 35%, #7DD3FC 65%, #0B1F3A 100%)',
          }}
        >
          {/* Day length label in the middle */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sand-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-navy-700 shadow-soft">
            {dayLength(sunrise, batis, sz.weather.hourShort, sz.weather.minuteShort)}
          </span>
        </div>
        <p className="mt-1.5 text-center text-[10px] uppercase tracking-wider text-navy-400">
          {sz.weather.dayLength}
        </p>
      </div>

      {/* Sunset */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500">
            {sz.weather.sunset}
          </p>
          <p className="font-display text-xl font-bold text-navy-900">
            {formatHour(locale, batis)}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-200 bg-sand-50"
        >
          <Icon
            name="Sunset"
            className="h-6 w-6 text-sky-700"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Day length for mobile */}
      <p className="text-center text-[11px] text-navy-500 sm:hidden">
        {sz.weather.dayLength}: {dayLength(sunrise, batis, sz.weather.hourShort, sz.weather.minuteShort)}
      </p>
    </div>
  );
}
