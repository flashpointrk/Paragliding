'use client';

/**
 * Dashboard weather summary (client).
 *
 * Uses the `useWeather` hook rather than fetching by hand, which removed the
 * duplicated code. It shows the suitability badge (with a pulse) and the key
 * metrics for the launch-site coordinate in a 2x2 grid.
 *
 * Styling:
 *  - Glass card
 *  - Pulsing badge (live data)
 *  - 2x2 metric grid
 *  - Stale warning
 */

import { LOCATION } from '@/lib/site';
import { useWeather } from '@/components/weather/useWeather';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/ui/Icon';

const COLOR: Record<string, BadgeVariant> = {
  green: 'green',
  amber: 'yellow',
  red: 'red',
};

const LABEL: Record<string, string> = {
  green: 'Uygun',
  amber: 'Dikkat',
  red: 'Not suitable',
};

export function AdminWeatherSummary(): JSX.Element {
  const { data: data, loading, error, stale } = useWeather(
    LOCATION.lat,
    LOCATION.lng
  );

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-navy-100 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-24 rounded bg-navy-100 animate-pulse" />
              <div className="h-2 w-20 rounded bg-navy-50 animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-16 rounded-full bg-navy-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-navy-50/60 p-3">
              <div className="h-2 w-12 rounded bg-navy-100 animate-pulse" />
              <div className="mt-2 h-4 w-16 rounded bg-navy-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-sunset-100 text-red-500">
            <Icon name="CloudOff" className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <p className="font-display text-sm font-bold text-navy-900">
              Weather
            </p>
            <p className="text-xs text-navy-500">{LOCATION.name}</p>
          </div>
        </div>
        <p className="text-sm text-navy-500">
          {error ?? 'Weather data is unavailable right now.'}
        </p>
      </div>
    );
  }

  const u = data.suitability;
  const variant = COLOR[u.status] ?? 'yellow';

  const metrics: { icon: IconName; label: string; value: string }[] = [
    { icon: 'Wind', label: 'Wind', value: `${data.current.windSpeed} km/h` },
    { icon: 'Gauge', label: 'Gust', value: `${data.current.windGust} km/h` },
    { icon: 'Thermometer', label: 'Temperature', value: `${data.current.temperature}°C` },
    { icon: 'Cloud', label: 'Cloud', value: `${data.current.cloudCover}%` },
  ];

  return (
    <div className="glass-card relative overflow-hidden rounded-xl p-5">
      {/* Decorative glow — tinted by the suitability colour */}
      <div
        className={
          'pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ' +
          (u.status === 'green'
            ? 'bg-green-400/15'
            : u.status === 'red'
              ? 'bg-red-400/15'
              : 'bg-yellow-400/15')
        }
        aria-hidden="true"
      />

      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-navy-700 text-white">
            <Icon name="CloudSun" className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <p className="font-display text-sm font-bold text-navy-900">
              Weather
            </p>
            <p className="text-xs text-navy-500">{LOCATION.name}</p>
          </div>
        </div>
        <Badge variant={variant} pulse>
          {LABEL[u.status] ?? u.status}
        </Badge>
      </div>

      {/* 2x2 metric grid — premium */}
      <div className="relative grid grid-cols-2 gap-2.5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="glass-light flex items-center gap-2.5 rounded-lg p-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/60 text-sky-600 ring-1 ring-navy-100">
              <Icon name={m.icon} className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-col">
              <p className="text-[10px] font-medium uppercase tracking-wide text-navy-400">
                {m.label}
              </p>
              <p className="font-display text-sm font-bold text-navy-800">
                {m.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {u.description ? (
        <p className="relative mt-3 text-xs leading-relaxed text-navy-500">
          {u.description}
        </p>
      ) : null}

      {stale ? (
        <div className="glass-light relative mt-3 flex items-start gap-2 rounded-lg border border-yellow-300/40 bg-yellow-50/60 p-2.5">
          <Icon
            name="AlertTriangle"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-600"
            aria-hidden="true"
          />
          <p className="text-xs text-yellow-700">
            The data may be cached and out of date.
          </p>
        </div>
      ) : null}
    </div>
  );
}
