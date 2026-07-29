'use client';

/**
 * Live weather summary for the home page — the "Open Sky" clean decision
 * surface.
 *
 * Two layouts:
 *  - default: a plain white card (hairline border plus shadow-soft) for light
 *    sections; suitability badge, temperature, wind and the safety note.
 *  - `compact`: a dark glass card over the hero photo, carrying only the badge,
 *    temperature, wind and the reading time. The safety note is not repeated
 *    here — the full text lives in the panel on `/live-conditions`.
 *
 * The whole card is clickable as a link (wrapped in an accessible <a>) to
 * `/live-conditions`. Stale data (>15 min) drops the badge to amber.
 */

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { SuitabilityBadge } from './SuitabilityBadge';
import { weatherCode, readingTime } from '@/lib/weather/open-meteo';
import { directionLabel } from '@/lib/weather/suitability';
import { useWeather } from './useWeather';
import { useDictionary } from '@/lib/i18n/useDictionary';

export interface LiveWeatherSummaryProps {
  lat?: number;
  lng?: number;
  refreshMs?: number;
  /**
   * The narrow in-hero layout: a dark glass surface with three lines that read
   * at a glance. There is no warning note — the full text lives on
   * `/live-conditions`.
   */
  compact?: boolean;
  className?: string;
}

function MiniLoader({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-navy-500">
      <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
      {text}
    </span>
  );
}

export function LiveWeatherSummary({
  lat = 37.02,
  lng = 28.27,
  refreshMs,
  compact = false,
  className,
}: LiveWeatherSummaryProps) {
  const { data, loading, stale } = useWeather(lat, lng, refreshMs);
  const { s: sz, locale } = useDictionary();

  // Stale caps the badge at amber
  let status = data?.suitability.status;
  if (stale && status === 'green') status = 'amber';

  const code = data ? weatherCode(data.current.weatherCode, locale) : null;
  // Shows the time of the Open-Meteo reading itself, not when it was cached.
  const updateLabel = data ? readingTime(data.current.time) : null;
  /** Do we have fresh data? The green dot on the compact card reflects this. */
  const streamLive = Boolean(data) && !stale;

  // ---------- Compact: a dark glass card over the hero photo ----------
  if (compact) {
    return (
      <Link
        href="/live-conditions"
        aria-label={sz.weather.liveStatus}
        className={cn(
          'group block rounded-2xl border border-white/15 bg-navy-950/55 p-4 text-white shadow-soft-lg backdrop-blur-md transition-colors duration-200 ease-smooth hover:border-white/30 hover:bg-navy-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900',
          className
        )}
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sand-200">
          {/* The green dot means the feed is live; it goes out when data stalls. */}
          <span
            aria-hidden="true"
            title={streamLive ? sz.weather.liveDataStream : sz.weather.dataPending}
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              streamLive
                ? 'bg-green-400 motion-safe:animate-pulse'
                : 'bg-sand-400'
            )}
          />
          {sz.weather.liveStatus}
        </span>

        {data && code ? (
          <>
            <div className="mt-2.5 flex items-center gap-2.5">
              <Icon
                name={code.icon}
                className="h-6 w-6 shrink-0 text-sky-300"
                aria-hidden="true"
              />
              <div>
                <span className="font-display text-3xl font-bold leading-none tracking-tight">
                  {Math.round(data.current.temperature)}°
                </span>
                <p className="mt-1.5 text-[11px] leading-none text-sand-200">
                  {code.label}
                </p>
              </div>
            </div>

            <p className="mt-2.5 flex items-center gap-1.5 whitespace-nowrap text-xs text-sand-100">
              <Icon
                name="Wind"
                className="h-3.5 w-3.5 shrink-0 text-sky-300"
                aria-hidden="true"
              />
              {Math.round(data.current.windSpeed)} {sz.weather.speedUnit} ·{' '}
              {directionLabel(data.current.windDirection, locale)} (
              {Math.round(data.current.windDirection)}°)
            </p>
          </>
        ) : (
          <p className="mt-3 text-xs text-sand-200">
            {loading ? sz.common.loading : sz.common.dataUnavailable}
          </p>
        )}
      </Link>
    );
  }

  // ---------- Default: the wide white card ----------
  return (
    <Link
      href="/live-conditions"
      aria-label={sz.weather.liveStatus}
      className={cn(
        'group block rounded-2xl border border-sand-200 bg-white p-5 shadow-soft transition-colors duration-200 ease-smooth hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Top row: title plus badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-red-500"
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy-500">
            {sz.weather.liveStatus}
          </span>
        </div>
        {data && status ? (
          <SuitabilityBadge status={status} size="sm" stale={stale} />
        ) : null}
      </div>

      {/* Main content: icon, temperature, wind */}
      <div className="mt-4 flex items-center gap-4">
        {data && code ? (
          <>
            <div
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-50"
            >
              <Icon name={code.icon} className="h-7 w-7 text-sky-600" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tracking-tight text-navy-900">
                  {Math.round(data.current.temperature)}°
                </span>
                <span className="text-xs font-medium text-navy-500">
                  {code.label}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-500">
                <Icon
                  name="Wind"
                  className="h-3 w-3 text-sky-500"
                  aria-hidden="true"
                />
                {sz.weather.wind} {Math.round(data.current.windSpeed)} {sz.weather.speedUnit} ·{' '}
                {directionLabel(data.current.windDirection, locale)} ({Math.round(data.current.windDirection)}°)
              </p>
            </div>
          </>
        ) : loading ? (
          <MiniLoader text={sz.common.loading} />
        ) : (
          <span className="text-sm text-navy-500">{sz.common.dataUnavailable}</span>
        )}
      </div>

      {/* Bottom row: last update plus the details link */}
      <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3">
        <span className="text-[11px] text-navy-400">
          {updateLabel
            ? `${sz.weather.readingTime} ${updateLabel}${stale ? ` ${sz.weather.staleData}` : ''}`
            : null}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600">
          {sz.weather.seeDetails}
          <Icon
            name="ArrowRight"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </span>
      </div>

      {/* Safety note */}
      <p className="mt-3 rounded-lg bg-sand-50 px-3 py-2 text-[10px] leading-tight text-navy-500">
        {sz.weather.pilotApproval}
      </p>
    </Link>
  );
}
