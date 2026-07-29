'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { formatHour } from '@/lib/i18n/format';
import { Icon } from '@/components/ui/Icon';
import { weatherCode } from '@/lib/weather/open-meteo';
import { directionLabel } from '@/lib/weather/suitability';
import type { HourlyForecast as HourlyForecastData } from '@/lib/weather/open-meteo';

/**
 * Hourly forecast table — the "Open Sky" clean decision surface.
 *
 * A flat white table card with a hairline border. It scrolls horizontally, and
 * each row picks up a plain sand-50 highlight on hover. Low visibility keeps
 * its red emphasis, because that carries meaning. The hour column is sticky, so
 * it stays put while scrolling sideways.
 */

export interface HourlyForecastProps {
  hours: HourlyForecastData[];
  /** How many hours to show from now (defaults to 12). */
  window?: number;
  /** Visibility threshold in km (rows below it are highlighted). */
  visibilityThresholdKm?: number;
  className?: string;
}


export function HourlyForecast({
  hours,
  window = 12,
  visibilityThresholdKm = 5,
  className,
}: HourlyForecastProps) {
  const { s: sz, locale } = useDictionary();
  // Take the hours inside the window, starting from now.
  const now = Date.now();
  const visible = hours
    .filter((s) => new Date(s.time).getTime() >= now - 60 * 60 * 1000)
    .slice(0, window);

  if (visible.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-sand-200 bg-white p-5 text-sm text-navy-500 shadow-soft',
          className
        )}
      >
        {sz.weather.noHourlyData}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-sand-200 px-5 py-3.5">
        <h4 className="flex items-center gap-1.5 font-display text-sm font-bold text-navy-900">
          <Icon name="Clock" className="h-4 w-4 text-sky-500" aria-hidden="true" />
          {sz.weather.hourlyForecast}
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-center text-sm">
          <thead>
            <tr className="bg-sand-50 text-xs uppercase tracking-wide text-navy-500">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-sand-50 px-3 py-2.5 text-left font-semibold"
              >
                {sz.weather.hour}
              </th>
              <th scope="col" className="px-2 py-2.5 font-semibold">
                {sz.weather.details}
              </th>
              <th scope="col" className="px-2 py-2.5 font-semibold">
                {sz.weather.temperature}
              </th>
              <th scope="col" className="px-2 py-2.5 font-semibold">
                {sz.weather.wind}
              </th>
              <th scope="col" className="px-2 py-2.5 font-semibold">
                {sz.weather.precipitation} %
              </th>
              <th scope="col" className="px-2 py-2.5 font-semibold">
                {sz.weather.visibility}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => {
              const code = weatherCode(s.weatherCode, locale);
              const visibilityPoor = s.visibility < visibilityThresholdKm;
              return (
                <tr
                  key={s.time}
                  className={cn(
                    'border-t border-sand-200 transition-colors duration-150 hover:bg-sand-50',
                    i % 2 === 1 ? 'bg-sand-50/50' : 'bg-white'
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white px-3 py-2.5 text-left font-semibold text-navy-900"
                  >
                    {formatHour(locale, s.time)}
                  </th>
                  <td className="px-2 py-2.5" title={code.label}>
                    <span className="inline-flex items-center justify-center">
                      <Icon
                        name={code.icon}
                        className="h-5 w-5 text-sky-600"
                        aria-hidden="true"
                      />
                      <span className="sr-only">{code.label}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 font-display font-bold text-navy-900">
                    {Math.round(s.temperature)}°
                  </td>
                  <td className="px-2 py-2.5 text-navy-700">
                    <div className="flex items-center justify-center gap-1 font-medium">
                      <Icon
                        name="Wind"
                        className="h-3 w-3 text-sky-500"
                        aria-hidden="true"
                      />
                      {Math.round(s.windSpeed)}{' '}
                      <span className="text-xs font-normal text-navy-400">
                        {sz.weather.speedUnit}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-navy-400">
                      <Icon
                        name="Compass"
                        className="h-2.5 w-2.5"
                        aria-hidden="true"
                      />
                      {directionLabel(s.windDirection, locale)}
                      {s.windGust > s.windSpeed + 5
                        ? ` · g${Math.round(s.windGust)}`
                        : ''}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-navy-700">
                    {s.precipitationProbability > 0 ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1',
                          s.precipitationProbability >= 60
                            ? 'font-semibold text-sky-700'
                            : 'text-navy-600'
                        )}
                      >
                        <Icon
                          name="Droplets"
                          className="h-3 w-3 text-sky-500"
                          aria-hidden="true"
                        />
                        %{Math.round(s.precipitationProbability)}
                      </span>
                    ) : (
                      <span className="text-navy-300">—</span>
                    )}
                  </td>
                  <td
                    className={cn(
                      'px-2 py-2.5',
                      visibilityPoor
                        ? 'font-semibold text-red-600'
                        : 'text-navy-700'
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Icon
                        name="Eye"
                        className={cn(
                          'h-3 w-3',
                          visibilityPoor ? 'text-red-500' : 'text-navy-400'
                        )}
                        aria-hidden="true"
                      />
                      {s.visibility >= 10 ? '10+' : s.visibility.toFixed(0)}
                      <span className="text-xs font-normal text-navy-400">
                        km
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-sand-200 px-5 py-2.5 text-[11px] text-navy-400">
        {sz.weather.directionAbbreviation}
      </p>
    </div>
  );
}
