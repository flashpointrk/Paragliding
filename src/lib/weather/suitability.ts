import { trIssueLabels, trSuitabilityText, trCompassPoints } from '@/messages/tr';
/**
 * Flight suitability logic.
 *
 * A location's `WeatherThreshold` values are compared against the current
 * conditions to produce a green/amber/red badge.
 *
 * The rules in short:
 *  - Every parameter is judged independently (wind, gust delta, precipitation,
 *    visibility, direction).
 *  - The OVERALL status is the worst parameter badge: red if any parameter is
 *    red, green only when they all are.
 *  - Thunderstorms (WMO 95-99) → automatically red.
 *  - Stale data (>15 min) → the badge drops to amber (handled in the UI, and
 *    also applied here through the `stale` flag).
 */

import type { WeatherThreshold } from '@prisma/client';
import type { CurrentWeather } from './open-meteo';
import { isThunderstorm } from './open-meteo';

// =====================================================
// TYPES
// =====================================================

export type SuitabilityStatus = 'green' | 'amber' | 'red';

/** The verdict for a single parameter. */
interface ParameterResult {
  name: string;
  status: SuitabilityStatus;
  reason: string;
}

export interface SuitabilityResult {
  status: SuitabilityStatus;
  reasons: string[];
  description: string;
  /** Stale-data warning, when present. */
  warning?: string;
}

// =====================================================
// YARDIMCILAR
// =====================================================

const SEVERITY_ORDER: Record<SuitabilityStatus, number> = { green: 0, amber: 1, red: 2 };

/** Returns the worse of two statuses. */
function worseOf(a: SuitabilityStatus, b: SuitabilityStatus): SuitabilityStatus {
  return SEVERITY_ORDER[a] >= SEVERITY_ORDER[b] ? a : b;
}

/**
 * Returns the 0-360 degree difference, for checks near a sector boundary.
 * E.g. the real difference between 350° and 10° is 20°, not 340°.
 */
function directionDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Checks whether a wind direction falls inside a given [min,max] sector. The
 * sector may wrap past 360° (e.g. min=350, max=20).
 *
 * @param direction wind direction in degrees
 * @param min       lower bound of the sector (inclusive)
 * @param max       upper bound of the sector (inclusive)
 * @param tolerance proximity margin in degrees — within ±tolerance of a bound
 *                  counts as being on the boundary
 * @returns 'inside' | 'boundary' | 'outside'
 */
function checkDirectionSector(
  direction: number,
  min: number,
  max: number,
  tolerance = 15
): 'inside' | 'edge' | 'outside' {
  // Normalize the sector to [0,360) and handle the 360° wrap.
  const a = ((min % 360) + 360) % 360;
  const b = ((max % 360) + 360) % 360;
  const y = ((direction % 360) + 360) % 360;

  const isInside = a <= b ? y >= a && y <= b : y >= a || y <= b;
  if (isInside) {
    // boundary proximity: the smallest angular distance to min or max
    const dist = Math.min(directionDelta(direction, min), directionDelta(direction, max));
    return dist <= tolerance ? 'edge' : 'inside';
  }
  // outside the sector, but within the boundary tolerance?
  const distOutside = Math.min(directionDelta(direction, min), directionDelta(direction, max));
  return distOutside <= tolerance ? 'edge' : 'outside';
}

/** Converts a bearing into a compass point (e.g. 0→N, 90→E, 180→S). */
/** Uygunluk metinlerinin dili. */
export type SuitabilityLocale = 'tr' | 'en';

const COMPASS_POINTS: Record<SuitabilityLocale, string[]> = {
  en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
  tr: trCompassPoints,
};

/** Phrase templates for the suitability explanations. */
const EN_TEXT = {
  wind: (v: string, y: number, sr: number) =>
    `Wind ${v} km/h (green limit ${y}, amber ${sr} km/h)`,
  gust: (delta: string, gust: string, average: string) =>
    `Gust spread ${delta} km/h (gusts ${gust} − average ${average})`,
  precipitation: (v: string, y: number, sr: number) =>
    `Precipitation ${v} mm (green limit ${y}, amber ${sr} mm)`,
  visibility: (v: string, y: number, sr: number) =>
    `Visibility ${v} km (green minimum ${y}, amber ${sr} km)`,
  directionInside: (direction: string, min: number, max: number) =>
    `Wind direction ${direction}, within the usable sector (${min}–${max}°)`,
  directionEdge: (direction: string, min: number, max: number) =>
    `Wind direction ${direction}, close to the sector edge (${min}–${max}°)`,
  directionOutside: (direction: string, min: number, max: number) =>
    `Wind direction ${direction}, outside the flying sector (${min}–${max}°)`,
  storm: (code: number) =>
    `Thunderstorm conditions (WMO code ${code}) → flying not permitted`,
  staleWarning: 'Live data could not be fetched; the reading shown may be out of date.',
  green: (wind: string, direction: string, gust: string, sector: boolean) =>
    `${sector ? `Wind ${wind} ${direction}, within the usable sector. ` : `Wind ${wind} ${direction}. `}Gusts ${gust}. Conditions look favourable.`,
  amber: (wind: string, direction: string, gust: string, extra: string, issue: string) =>
    `Wind ${wind} ${direction}, gusts ${gust}.${extra} ${issue} Care is needed; the pilot makes the final call.`,
  red: (wind: string, direction: string, gust: string, extra: string, issue: string) =>
    `Wind ${wind} ${direction}, gusts ${gust}.${extra} ${issue} Flying is not suitable.`,
  status: { green: 'Suitable', amber: 'Caution', red: 'Not suitable' },
  parameterName: {
    wind: 'wind speed',
    gust: 'gust spread',
    precipitation: 'precipitation',
    visibility: 'visibility',
    direction: 'wind direction',
    storm: 'storm',
  } as Record<string, string>,
  issuePrefix: (critical: boolean) => (critical ? 'Critical: ' : 'Borderline: '),
  conjunction: ' and ',
};

/** Phrase templates per locale; every non-default locale lives in `src/messages`. */
const SUITABILITY_TEXT: Record<SuitabilityLocale, typeof EN_TEXT> = {
  en: EN_TEXT,
  tr: trSuitabilityText as unknown as typeof EN_TEXT,
};

export function directionLabel(direction: number, locale: SuitabilityLocale = 'en'): string {
  const y = ((direction % 360) + 360) % 360;
  const idx = Math.round(y / 45) % 8;
  return COMPASS_POINTS[locale][idx] as string;
}


// =====================================================
// PARAMETRE HESAPLAMALARI
// =====================================================

interface ThresholdInput {
  windMaxGreen: number;
  windMaxAmber: number;
  gustDeltaMaxGreen: number;
  gustDeltaMaxAmber: number;
  precipMaxGreen: number;
  precipMaxAmber: number;
  visibilityMinGreen: number;
  visibilityMinAmber: number;
  windSectorMin?: number | null;
  windSectorMax?: number | null;
  takeoffHeading: number;
}

/**
 * Computes suitability.
 *
 * @param current    Current Open-Meteo reading
 * @param threshold  The location threshold (Prisma model)
 * @param opts.stale Is the data old? (true caps the result at amber)
 */
export function computeSuitability(
  current: CurrentWeather,
  threshold: ThresholdInput,
  opts: { stale?: boolean; locale?: SuitabilityLocale } = {}
): SuitabilityResult {
  const locale: SuitabilityLocale = opts.locale ?? 'en';
  const m = SUITABILITY_TEXT[locale];
  const parameters: ParameterResult[] = [];

  // --- 1) Mean wind (km/h) ---
  const wind = current.windSpeed;
  let windStatus: SuitabilityStatus;
  if (wind <= threshold.windMaxGreen) windStatus = 'green';
  else if (wind <= threshold.windMaxAmber) windStatus = 'amber';
  else windStatus = 'red';
  parameters.push({
    name: 'wind',
    status: windStatus,
    reason: m.wind(String(Math.round(wind)), threshold.windMaxGreen, threshold.windMaxAmber),
  });

  // --- 2) Gust delta (gust − mean) ---
  const gustDelta = Math.max(0, current.windGust - current.windSpeed);
  let gustStatus: SuitabilityStatus;
  if (gustDelta <= threshold.gustDeltaMaxGreen) gustStatus = 'green';
  else if (gustDelta <= threshold.gustDeltaMaxAmber) gustStatus = 'amber';
  else gustStatus = 'red';
  parameters.push({
    name: 'gust',
    status: gustStatus,
    reason: m.gust(String(Math.round(gustDelta)), String(Math.round(current.windGust)), String(Math.round(current.windSpeed))),
  });

  // --- 3) Precipitation (mm) ---
  const precipitation = current.precipitation;
  let precipitationStatus: SuitabilityStatus;
  if (precipitation <= threshold.precipMaxGreen) precipitationStatus = 'green';
  else if (precipitation <= threshold.precipMaxAmber) precipitationStatus = 'amber';
  else precipitationStatus = 'red';
  parameters.push({
    name: 'precipitation',
    status: precipitationStatus,
    reason: m.precipitation(precipitation.toFixed(1), threshold.precipMaxGreen, threshold.precipMaxAmber),
  });

  // --- 4) Visibility (km) ---
  // Open-Meteo reports hourly visibility in metres and omits it from the
  // current block, so the parameter is skipped when absent (not enough data).
  const visibilityKm =
    'visibility' in current && typeof (current as { visibility?: number }).visibility === 'number'
      ? (current as { visibility: number }).visibility
      : null;
  if (visibilityKm !== null) {
    let visibilityStatus: SuitabilityStatus;
    if (visibilityKm >= threshold.visibilityMinGreen) visibilityStatus = 'green';
    else if (visibilityKm >= threshold.visibilityMinAmber) visibilityStatus = 'amber';
    else visibilityStatus = 'red';
    parameters.push({
      name: 'visibility',
      status: visibilityStatus,
      reason: m.visibility(visibilityKm.toFixed(1), threshold.visibilityMinGreen, threshold.visibilityMinAmber),
    });
  }

  // --- 5) Wind direction sector ---
  if (
    threshold.windSectorMin != null &&
    threshold.windSectorMax != null &&
    Number.isFinite(threshold.windSectorMin) &&
    Number.isFinite(threshold.windSectorMax)
  ) {
    const status = checkDirectionSector(
      current.windDirection,
      threshold.windSectorMin,
      threshold.windSectorMax,
      15
    );
    const directionLabelText = `${Math.round(current.windDirection)}° (${directionLabel(current.windDirection, locale)})`;
    if (status === 'inside') {
      parameters.push({
        name: 'direction',
        status: 'green',
        reason: m.directionInside(directionLabelText, Math.round(threshold.windSectorMin), Math.round(threshold.windSectorMax)),
      });
    } else if (status === 'edge') {
      parameters.push({
        name: 'direction',
        status: 'amber',
        reason: m.directionEdge(directionLabelText, Math.round(threshold.windSectorMin), Math.round(threshold.windSectorMax)),
      });
    } else {
      parameters.push({
        name: 'direction',
        status: 'red',
        reason: m.directionOutside(directionLabelText, Math.round(threshold.windSectorMin), Math.round(threshold.windSectorMax)),
      });
    }
  }

  // --- 6) Thunderstorm (WMO 95-99) → automatically red ---
  if (isThunderstorm(current.weatherCode)) {
    parameters.push({
      name: 'storm',
      status: 'red',
      reason: m.storm(current.weatherCode),
    });
  }

  // --- Overall: the worst parameter ---
  let total: SuitabilityStatus = 'green';
  for (const p of parameters) {
    total = worseOf(total, p.status);
  }

  // --- Stale data → amber at best ---
  let warning: string | undefined;
  if (opts.stale) {
    total = worseOf(total, 'amber');
    warning = m.staleWarning;
  }

  const reasons = parameters.map((p) => p.reason);
  const description = buildSummary(total, current, parameters, threshold, locale);

  return { status: total, reasons, description, warning };
}

// =====================================================
// HUMAN-READABLE EXPLANATION
// =====================================================

/**
 * Builds a short, readable explanation from the overall status and the
 * individual parameters. It does not replace the pilot's own assessment.
 */
function buildSummary(
  status: SuitabilityStatus,
  current: CurrentWeather,
  parameters: ParameterResult[],
  threshold: ThresholdInput,
  locale: SuitabilityLocale = 'en'
): string {
  const m = SUITABILITY_TEXT[locale];
  const unit = locale === 'en' ? 'km/h' : 'km/s';
  const directionText = `${Math.round(current.windDirection)}° (${directionLabel(current.windDirection, locale)})`;
  const windText = `${Math.round(current.windSpeed)} ${unit}`;
  const gustStr = `${Math.round(current.windGust)} ${unit}`;

  const hasSector =
    threshold.windSectorMin != null &&
    threshold.windSectorMax != null &&
    Number.isFinite(threshold.windSectorMin) &&
    Number.isFinite(threshold.windSectorMax);

  // Collect the sector information
  const directionParam = parameters.find((p) => p.name === 'direction');
  let directionNote = hasSector
    ? directionParam
      ? directionParam.reason.split(',').slice(1).join(',').trim()
      : ''
    : '';
  // This follows a full stop rather than sitting mid-sentence, so capitalize.
  if (directionNote) directionNote = directionNote.charAt(0).toUpperCase() + directionNote.slice(1);

  if (status === 'green') {
    return m.green(windText, directionText, gustStr, hasSector);
  }

  if (status === 'amber') {
    // which parameters are amber/red? list them briefly
    const issues = parameters
      .filter((p) => p.status !== 'green')
      .map((p) => p.name);
    const issueText = issueSummary(issues, false, locale);
    const extra = directionNote ? ` ${directionNote}.` : '';
    return m.amber(windText, directionText, gustStr, extra, issueText);
  }

  // kirmizi
  const issues = parameters
    .filter((p) => p.status === 'red')
    .map((p) => p.name);
  const issueText = issueSummary(issues, true, locale);
  const extra = directionNote ? ` ${directionNote}.` : '';
  return m.red(windText, directionText, gustStr, extra, issueText);
}

/** Renders the names of the failing parameters as text. */
/** Short phrases naming the parameters that made a flight unsuitable. */
const EN_ISSUE_LABELS: Record<string, string> = {
  wind: 'wind is strong',
  gust: 'gust spread is high',
  precipitation: 'there is precipitation',
  visibility: 'visibility is low',
  direction: 'wind direction is unfavourable',
  storm: 'a storm is expected',
};

function issueSummary(
  names: string[],
  critical = false,
  locale: SuitabilityLocale = 'en'
): string {
  if (names.length === 0) return '';
  const labels: Record<SuitabilityLocale, Record<string, string>> = {
    en: EN_ISSUE_LABELS,
    tr: trIssueLabels,
  };
  const m = SUITABILITY_TEXT[locale];
  const texts = names.map((a) => labels[locale][a] ?? a).filter(Boolean);
  if (texts.length === 0) return '';
  const prefix = critical ? m.issuePrefix(true) : '';
  if (texts.length === 1) return `${prefix}${texts[0]}.`;
  return `${prefix}${texts.slice(0, -1).join(', ')}${m.conjunction}${texts[texts.length - 1]}.`;
}

// =====================================================
// UI YARDIMCILARI
// =====================================================

/** Maps a status onto a badge variant (used by the UI). */
export function statusToBadge(d: SuitabilityStatus): 'green' | 'yellow' | 'red' {
  if (d === 'green') return 'green';
  if (d === 'amber') return 'yellow';
  return 'red';
}

/** Badge label for a status. */
export function statusLabel(d: SuitabilityStatus, locale: SuitabilityLocale = 'en'): string {
  return SUITABILITY_TEXT[locale].status[d];
}

/** Safe conversion from the Prisma `WeatherThreshold` to this module's input. */
export function thresholdInput(threshold: WeatherThreshold): ThresholdInput {
  return {
    windMaxGreen: threshold.windMaxGreen,
    windMaxAmber: threshold.windMaxAmber,
    gustDeltaMaxGreen: threshold.gustDeltaMaxGreen,
    gustDeltaMaxAmber: threshold.gustDeltaMaxAmber,
    precipMaxGreen: threshold.precipMaxGreen,
    precipMaxAmber: threshold.precipMaxAmber,
    visibilityMinGreen: threshold.visibilityMinGreen,
    visibilityMinAmber: threshold.visibilityMinAmber,
    windSectorMin: threshold.windSectorMin,
    windSectorMax: threshold.windSectorMax,
    takeoffHeading: threshold.takeoffHeading,
  };
}
