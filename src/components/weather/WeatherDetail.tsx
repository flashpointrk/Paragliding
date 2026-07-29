'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { CurrentWeather } from '@/lib/weather/open-meteo';

/**
 * Weather detail card — the "Open Sky" clean decision surface.
 *
 * A 2x2 grid where each cell is a plain white card with a hairline border:
 *  - UV: a colour scale (green→amber→orange→red→purple, which carries meaning)
 *    and a filling bar
 *  - Pressure: a trend arrow (↑↓→) and the hPa value
 *  - Humidity: a percentage with a droplet icon (lucide Droplet)
 *  - Visibility: km with an eye icon (lucide Eye)
 *
 * Note: Open-Meteo's `current` block carries neither UV nor visibility, so
 * those fields are optional here.
 */

export interface WeatherDetailProps {
  current: CurrentWeather;
  /** UV index (absent from Open-Meteo current; pass the daily max or an hourly value). */
  uvIndex?: number;
  /** Optional: humidity percentage (average the hourly data when current lacks it). */
  humidityPercent?: number;
  /** Optional: visibility in km (Open-Meteo current has no visibility). */
  visibilityKm?: number;
  /** Optional: pressure trend against the previous reading (hPa). */
  pressureTrend?: number;
  className?: string;
}

// =====================================================
// UV
// =====================================================

interface UvClass {
  label: string;
  /** Etiket rozeti (kap bg + metin). */
  color: string;
  text: string;
  advice: string;
  /** Bar fill percentage (0-100). UV 11+ fills it completely. */
  fill: number;
}

function uvClass(uv: number, sz: Dictionary): UvClass {
  // Bar fill on a 0-11 scale (11+ = 100%)
  const fill = Math.min(100, (uv / 11) * 100);
  if (uv < 3)
    return {
      label: sz.weather.uvLow,
      color: 'bg-green-100 text-green-800',
      text: sz.weather.uvLow,
      advice: sz.weather.uvLowAdvice,
      fill,
    };
  if (uv < 6)
    return {
      label: sz.weather.uvModerate,
      color: 'bg-yellow-100 text-yellow-800',
      text: sz.weather.uvModerate,
      advice: sz.weather.uvModerateAdvice,
      fill,
    };
  if (uv < 8)
    return {
      label: sz.weather.uvHigh,
      color: 'bg-orange-100 text-orange-800',
      text: sz.weather.uvHigh,
      advice: sz.weather.uvHighAdvice,
      fill,
    };
  if (uv < 11)
    return {
      label: sz.weather.uvVeryHigh,
      color: 'bg-red-100 text-red-800',
      text: sz.weather.uvVeryHigh,
      advice: sz.weather.uvVeryHighAdvice,
      fill,
    };
  return {
    label: sz.weather.uvExtreme,
    color: 'bg-purple-100 text-purple-800',
    text: sz.weather.uvExtreme,
    advice: sz.weather.uvExtremeAdvice,
    fill,
  };
}

// =====================================================
// PRESSURE TREND
// =====================================================

function pressureTrendText(
  delta: number | undefined,
  sz: Dictionary
): { icon: IconName; text: string } {
  if (delta == null || !Number.isFinite(delta))
    return { icon: 'Navigation', text: sz.weather.pressureSteady };
  if (Math.abs(delta) < 0.5) return { icon: 'Navigation', text: sz.weather.pressureSteadyAlt };
  if (delta > 0) return { icon: 'ArrowUpRight', text: sz.weather.pressureRising };
  return { icon: 'ArrowRight', text: sz.weather.pressureFalling };
}

// =====================================================
// DETAIL CELL
// =====================================================

interface CellProps {
  icon: IconName;
  iconColour: string;
  label: string;
  value: React.ReactNode;
  unit?: string;
  alt: React.ReactNode;
  children?: React.ReactNode;
}

function Cell({
  icon,
  iconColour,
  label,
  value,
  unit,
  alt,
  children,
}: CellProps) {
  // With no data ("—" or empty) the card is not rendered at all: it drops out
  // of the grid rather than showing an empty cell.
  const noData =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && ['—', '-', '', '–'].includes(value.trim()));
  if (noData) return null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-sand-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-navy-500">
          <Icon name={icon} className={cn('h-3.5 w-3.5', iconColour)} aria-hidden="true" />
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-navy-900">
          {value}
        </span>
        {unit ? (
          <span className="text-xs text-navy-400">{unit}</span>
        ) : null}
      </div>
      {children}
      <p className="mt-auto text-[11px] leading-snug text-navy-500">{alt}</p>
    </div>
  );
}

// =====================================================
// COMPONENT
// =====================================================

export function WeatherDetail({
  current,
  uvIndex,
  humidityPercent,
  visibilityKm,
  pressureTrend,
  className,
}: WeatherDetailProps) {
  const { s: sz } = useDictionary();
  const uv = uvClass(uvIndex ?? 0, sz);
  const trend = pressureTrendText(pressureTrend, sz);

  // Cells without data are never rendered inside `Cell`, and the grid's column
  // count shrinks with the number of visible cards so no row is left empty.
  const visibleCount = [
    true, // UV is always shown (treated as 0 when absent)
    Number.isFinite(current.pressureSeaLevel),
    humidityPercent != null,
    visibilityKm != null,
  ].filter(Boolean).length;

  const gridClass =
    visibleCount >= 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : visibleCount === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : visibleCount === 2
          ? 'grid-cols-2'
          : 'grid-cols-1';

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="flex items-center gap-1.5 font-display text-sm font-bold text-navy-900">
        <Icon name="Gauge" className="h-4 w-4 text-sky-500" aria-hidden="true" />
        {sz.weather.details}
      </h4>

      <div className={cn('grid gap-3', gridClass)}>
        {/* UV — gradient colour scale plus the filling bar */}
        <Cell
          icon="Sun"
          iconColour="text-sky-500"
          label={sz.weather.uvIndex}
          value={Math.round(uvIndex ?? 0)}
          alt={
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  uv.color
                )}
              >
                {uv.text}
              </span>
              <span className="leading-snug">{uv.advice}</span>
            </span>
          }
        >
          {/* Gradient colour scale bar — green→amber→orange→red→purple */}
          <div
            className="relative h-1.5 w-full overflow-hidden rounded-full"
            style={{
              background:
                'linear-gradient(to right, #4ade80 0%, #facc15 25%, #fb923c 50%, #ef4444 75%, #a855f7 100%)',
            }}
          >
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-navy-900 shadow-md transition-[left] duration-700 ease-smooth"
              style={{ left: `${uv.fill}%` }}
              aria-hidden="true"
            />
          </div>
        </Cell>

        {/* Pressure — trend arrow */}
        <Cell
          icon="Gauge"
          iconColour="text-navy-500"
          label={sz.weather.pressure}
          value={Math.round(current.pressureSeaLevel)}
          unit="hPa"
          alt={
            <span className="inline-flex items-center gap-1">
              <Icon
                name={trend.icon}
                className="h-3 w-3 text-sky-500"
                aria-hidden="true"
              />
              {trend.text}
            </span>
          }
        />

        {/* Nem — damla ikonu */}
        <Cell
          icon="Droplet"
          iconColour="text-sky-500"
          label={sz.weather.humidity}
          value={humidityPercent != null ? Math.round(humidityPercent) : '—'}
          unit={humidityPercent != null ? '%' : undefined}
          alt={
            humidityPercent == null
              ? sz.weather.noData
              : humidityPercent >= 80
                ? sz.weather.humidityHigh
                : humidityPercent >= 50
                  ? sz.weather.humidityModerate
                  : sz.weather.humidityLow
          }
        />

        {/* Visibility — eye icon */}
        <Cell
          icon="Eye"
          iconColour="text-sky-500"
          label={sz.weather.visibility}
          value={
            visibilityKm != null ? (visibilityKm >= 10 ? '10+' : visibilityKm.toFixed(0)) : '—'
          }
          unit={visibilityKm != null ? 'km' : undefined}
          alt={
            visibilityKm == null
              ? sz.weather.noData
              : visibilityKm >= 10
                ? sz.weather.visibilityClear
                : visibilityKm >= 5
                  ? sz.weather.visibilityModerate
                  : sz.weather.visibilityLow
          }
        />
      </div>
    </div>
  );
}
