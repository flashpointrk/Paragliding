'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { formatHour } from '@/lib/i18n/format';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { weatherCode, readingTime } from '@/lib/weather/open-meteo';
import type { SuitabilityStatus } from '@/lib/weather/suitability';
import type { CurrentWeather } from '@/lib/weather/open-meteo';

/**
 * Top weather card — the "Open Sky" clean decision surface.
 *
 * Inside a flat dark navy header (bg-navy-900):
 *  - Icon (a plain circle)
 *  - Huge temperature (display font, 6xl) with a subtle "feels like"
 *  - Description text (the reason for the suitability verdict)
 *  - A thin line with the last update and the data source
 *  - Stale warning (plain red text/badge — no pulse)
 *  - The FIXED "no flight without pilot approval" note
 */

export interface WeatherPanelProps {
  current: CurrentWeather;
  status: SuitabilityStatus;
  locationName: string;
  lastUpdated: string; // ISO
  stale?: boolean;
  description?: string;
  /** Stale-data warning text (shown when present). */
  warning?: string;
  className?: string;
}

export function WeatherPanel({
  current,
  status,
  locationName,
  lastUpdated,
  stale = false,
  description,
  warning,
  className,
}: WeatherPanelProps) {
  const { s: sz, locale } = useDictionary();
  const code = weatherCode(current.weatherCode, locale);

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header — a flat dark navy surface */}
      <div className="bg-navy-900 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-sky-200">
              <Icon
                name="MapPin"
                className="h-4 w-4 text-sky-300"
                aria-hidden="true"
              />
              {locationName}
            </p>

            <div className="mt-4 flex items-center gap-4">
              {/* Icon — a plain circle */}
              <div
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 sm:h-20 sm:w-20"
              >
                <Icon
                  name={code.icon}
                  className="h-8 w-8 text-sky-100 sm:h-10 sm:w-10"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-5xl font-bold leading-none tracking-tight text-white sm:text-6xl">
                    {Math.round(current.temperature)}°
                  </span>
                  <span className="text-sm text-sky-100/80">
                    {Math.round(current.feelsLike)}° {sz.weather.feelsLike}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-sky-100/90">
                  {code.label}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Suitability explanation */}
        {description ? (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-sky-50/90">
            {description}
          </p>
        ) : null}

        {/* Stale warning — plain */}
        {stale && warning ? (
          <p
            role="status"
            className="mt-3 flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100"
          >
            <Icon
              name="AlertTriangle"
              className="h-4 w-4 shrink-0 text-red-300"
              aria-hidden="true"
            />
            {warning}
          </p>
        ) : null}
      </div>

      {/* Footer strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 bg-sand-50 px-6 py-3.5 text-xs text-navy-500 sm:px-8">
        <span className="flex items-center gap-1.5">
          <Icon
            name="Clock"
            className="h-3.5 w-3.5 text-navy-400"
            aria-hidden="true"
          />
          {sz.weather.readingTime}:{' '}
          <strong
            className="font-semibold text-navy-700"
            title={formatHour(locale, lastUpdated)}
          >
            {readingTime(current.time)}
          </strong>
          {stale ? ` ${sz.weather.staleData}` : ''}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 py-1 text-[11px] font-semibold text-navy-700"
          title={sz.weather.pilotApproval}
        >
          <Icon
            name="Shield"
            className="h-3 w-3 text-sky-500"
            aria-hidden="true"
          />
          {sz.weather.pilotApproval}
        </span>
      </div>
    </Card>
  );
}
