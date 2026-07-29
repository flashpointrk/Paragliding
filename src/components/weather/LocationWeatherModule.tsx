'use client';

/**
 * Combined weather module for the take-off site — the "Open Sky" clean decision
 * surface.
 *
 * Inside a plain white container: WeatherPanel, WindIndicator and the reasons
 * list, plus (in full mode) HourlyForecast, WeatherDetail and SunInfo, all
 * wrapped in a single subtle Reveal.
 *
 * Loading: a plain skeleton (no pulse, just flat grey blocks).
 * Error: EmptyState (the lucide CloudOff icon).
 * Client component: pulls data through `/api/weather` (the useWeather hook).
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Reveal } from '@/components/motion/Reveal';
import { WeatherPanel } from './WeatherPanel';
import { WindIndicator } from './WindIndicator';
import { HourlyForecast } from './HourlyForecast';
import { SunInfo } from './SunInfo';
import { WeatherDetail } from './WeatherDetail';
import { useWeather } from './useWeather';
import { useDictionary } from '@/lib/i18n/useDictionary';
import type { Dictionary } from '@/lib/i18n/dictionary';

export interface LocationWeatherModuleProps {
  lat: number;
  lng: number;
  /** Full mode: also show the hourly forecast, sun info and the details. */
  tamMod?: boolean;
  /** Auto-refresh interval in ms (defaults to 10 min). */
  refreshMs?: number;
  className?: string;
}

/** Plain loading indicator — flat grey blocks (Tailwind's standard pulse). */
function LoadingState() {
  return (
    <div className="space-y-4">
      {/* Panel skeleton */}
      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft">
        <div className="bg-navy-900 p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-4 flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
            </div>
          </div>
          <div className="mt-4 h-3 w-full animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="h-3 w-32 animate-pulse rounded bg-sand-100" />
          <div className="h-5 w-40 animate-pulse rounded-full bg-sand-100" />
        </div>
      </div>

      {/* Wind and reasons skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl border border-sand-200 bg-sand-100" />
        <div className="h-64 animate-pulse rounded-2xl border border-sand-200 bg-sand-100 sm:col-span-2" />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  again,
  sz,
}: {
  message: string;
  again: () => void;
  sz: Dictionary;
}) {
  return (
    <EmptyState
      icon="CloudOff"
      title={sz.weather.weatherUnavailable}
      description={message}
      action={
        <button
          type="button"
          onClick={again}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-navy-900 px-5 text-sm font-semibold text-white transition-colors duration-200 ease-smooth hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <Icon name="Loader2" className="h-4 w-4" aria-hidden="true" />
          {sz.weather.retry}
        </button>
      }
    />
  );
}

export function LocationWeatherModule({
  lat,
  lng,
  tamMod = false,
  refreshMs,
  className,
}: LocationWeatherModuleProps) {
  const { s: sz } = useDictionary();
  const { data, loading, error, stale, refetch } = useWeather(
    lat,
    lng,
    refreshMs
  );

  if (loading && !data) {
    return (
      <div className={cn('space-y-4', className)}>
        <LoadingState />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={className}>
        <ErrorState message={error} again={refetch} sz={sz} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={className}>
        <ErrorState message={sz.weather.dataNotAvailable} again={refetch} sz={sz} />
      </div>
    );
  }

  // Stale data drops the suitability status to amber (visually)
  let status = data.suitability.status;
  if (stale && status === 'green') status = 'amber';

  return (
    <div className={cn('space-y-4', className)}>
      <WeatherPanel
        current={data.current}
        status={status}
        locationName={data.threshold.locationName}
        lastUpdated={data.lastUpdated}
        stale={stale}
        description={data.suitability.description}
        warning={
          data.suitability.warning ??
          sz.weather.currentDataUnavailable
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WindIndicator
          speed={data.current.windSpeed}
          direction={data.current.windDirection}
          gust={data.current.windGust}
          sectorMin={data.threshold.windSectorMin}
          sectorMax={data.threshold.windSectorMax}
          takeoffHeading={data.threshold.takeoffHeading}
        />

        {/* Reasons box — a plain white card */}
        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft sm:col-span-2 lg:col-span-2">
          <h4 className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold text-navy-900">
            <Icon
              name="Sparkles"
              className="h-4 w-4 text-sky-500"
              aria-hidden="true"
            />
            {sz.weather.suitabilityAssessment}
          </h4>
          <ul className="space-y-2 text-xs text-navy-600">
            {data.suitability.reasons.map((n, i) => (
              <li key={i} className="flex gap-2">
                <Icon
                  name="Check"
                  className="mt-0.5 h-3 w-3 shrink-0 text-sky-500"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-[11px] leading-snug text-navy-500">
            <Icon
              name="Shield"
              className="mt-0.5 h-3 w-3 shrink-0 text-sky-500"
              aria-hidden="true"
            />
            <span>
              {sz.weather.assessmentNote}{' '}
              <strong className="font-semibold text-navy-700">
                {sz.weather.pilotApproval}
              </strong>
            </span>
          </p>
        </div>
      </div>

      {loading && data ? (
        <p className="flex items-center justify-center gap-1.5 text-xs text-navy-400">
          <Icon
            name="Loader2"
            className="h-3 w-3 animate-spin"
            aria-hidden="true"
          />
          Refreshing…
        </p>
      ) : null}

      {tamMod ? (
        <Reveal y={12} className="space-y-4">
          {/* Today's sun information */}
          {data.daily[0] ? (
            <SunInfo
              sunrise={data.daily[0].sunrise}
              batis={data.daily[0].sunset}
            />
          ) : null}

          {/* Saatlik tahmin */}
          <HourlyForecast hours={data.hourly} window={12} />

          {/* Details: UV, pressure, humidity, visibility */}
          <WeatherDetail
            current={data.current}
            uvIndex={
              nearestHourlyValue(data.hourly, 'uvIndex') ??
              data.daily[0]?.uvIndexMax
            }
            visibilityKm={nearestHourlyValue(data.hourly, 'visibility') ?? undefined}
          />
        </Reveal>
      ) : null}
    </div>
  );
}

/** Returns a field from the hourly row closest to now. */
function nearestHourlyValue<T extends 'uvIndex' | 'visibility'>(
  hours: { time: string; uvIndex: number; visibility: number }[],
  field: T
): number | undefined {
  if (hours.length === 0) return undefined;
  const now = Date.now();
  let nearest = hours[0];
  if (!nearest) return undefined;
  let smallestDelta = Math.abs(new Date(nearest.time).getTime() - now);
  for (let i = 1; i < hours.length; i++) {
    const s = hours[i];
    if (!s) continue;
    const delta = Math.abs(new Date(s.time).getTime() - now);
    if (delta < smallestDelta) {
      smallestDelta = delta;
      nearest = s;
    }
  }
  return nearest[field];
}
