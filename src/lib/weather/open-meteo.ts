import { trWeatherLabels } from '@/messages/tr';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
/**
 * Open-Meteo API wrapper (keyless, server side).
 *
 * Source: https://open-meteo.com/ (free, no API key required). Every client
 * request goes through this module as a server-side proxy; the browser never
 * calls Open-Meteo directly.
 */

// =====================================================
// TYPES
// =====================================================

import type { IconName } from '@/components/ui/Icon';

/** WMO weather code → label plus a lucide icon name. */
export interface WeatherCode {
  label: string;
  /** Lucide icon name (registered in the Icon registry). */
  icon: IconName;
}

/** Current conditions. */
export interface CurrentWeather {
  time: string; // ISO8601
  temperature: number; // °C (temperature_2m)
  feelsLike: number; // °C (apparent_temperature)
  isDaytime: boolean; // is_day (1/0)
  precipitation: number; // mm (precipitation)
  rain: number; // mm (rain)
  weatherCode: number; // WMO kodu
  cloudCover: number; // % (cloud_cover)
  pressureSeaLevel: number; // hPa (pressure_msl)
  pressureSurface: number; // hPa (surface_pressure)
  windSpeed: number; // km/s (wind_speed_10m)
  windDirection: number; // derece (wind_direction_10m)
  windGust: number; // km/s (wind_gusts_10m)
}

/** A single hourly forecast row. */
export interface HourlyForecast {
  time: string; // ISO8601
  temperature: number;
  feelsLike: number;
  precipitationProbability: number; // %
  precipitation: number; // mm
  cloudCover: number; // %
  visibility: number; // metres (Open-Meteo's unit) → converted to km
  uvIndex: number;
  windSpeed: number; // km/s
  windDirection: number; // derece
  windGust: number; // km/s
  weatherCode: number;
}

/** A single daily forecast row. */
export interface DailyForecast {
  date: string; // ISO date
  sunrise: string; // ISO
  sunset: string; // ISO
  uvIndexMax: number;
  precipitationProbabilityMax: number; // %
  windSpeedMax: number; // km/s
  windGustMax: number; // km/s
}

/** Type-safe weather payload built from the Open-Meteo response. */
export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone: string;
  utcOffsetSn: number;
}

// =====================================================
// WEATHER CODE MAPPING (WMO → label + icon)
// =====================================================

/**
 * WMO weather_code → label and emoji icon.
 * Reference: https://open-meteo.com/en/docs (weather_code)
 *
 * Code ranges:
 *  0     : Clear
 *  1-3   : Mainly clear / partly cloudy / overcast
 *  45-48 : Fog and rime fog
 *  51-57 : Drizzle
 *  61-67 : Rain (and variants)
 *  71-77 : Snow
 *  80-82 : Showers
 *  95-99 : Thunderstorm
 */
/** English labels for the WMO codes. */
const WMO_EN: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail',
};

/** Lucide icon per WMO code. Shared by every locale. */
const WMO_ICONS: Record<number, IconName> = {
  0: 'Sun',
  1: 'CloudSun',
  2: 'CloudSun',
  3: 'Cloudy',
  45: 'CloudFog',
  48: 'CloudFog',
  51: 'CloudDrizzle',
  53: 'CloudDrizzle',
  55: 'CloudDrizzle',
  56: 'CloudDrizzle',
  57: 'CloudRain',
  61: 'CloudDrizzle',
  63: 'CloudRain',
  65: 'CloudRain',
  66: 'CloudRain',
  67: 'CloudRain',
  71: 'CloudSnow',
  73: 'Snowflake',
  75: 'Snowflake',
  77: 'CloudSnow',
  80: 'CloudDrizzle',
  81: 'CloudRain',
  82: 'CloudRain',
  85: 'CloudSnow',
  86: 'Snowflake',
  95: 'CloudLightning',
  96: 'CloudLightning',
  99: 'CloudLightning',
};

/**
 * Resolves a WMO weather code into a label and an icon for the given locale.
 * The label falls back to the default locale when a translation is missing.
 */
export function weatherCode(code: number, locale: Locale | string = DEFAULT_LOCALE): WeatherCode {
  const icon = WMO_ICONS[code] ?? 'HelpCircle';
  if (locale !== DEFAULT_LOCALE) {
    const translated = trWeatherLabels[code];
    if (translated) return { label: translated, icon };
  }
  return { label: WMO_EN[code] ?? 'Unknown', icon };
}

/** Thunderstorm codes (95-99) — critical for flying. */
export function isThunderstorm(code: number): boolean {
  return code >= 95 && code <= 99;
}

/**
 * Open-Meteo timestamp ("2026-07-25T12:15") → "12:15".
 *
 * With `timezone=auto` the stamp is already the location's local time. Passing
 * it through `Date` would shift it into the visitor's timezone (showing the
 * wrong hour to someone browsing from abroad), so it is sliced directly.
 */
export function readingTime(time: string): string {
  return /T(\d{2}:\d{2})/.exec(time)?.[1] ?? '—';
}

// =====================================================
// FETCH
// =====================================================

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const FETCH_TIMEOUT_MS = 8000;

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'rain',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
] as const;

const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'cloud_cover',
  'visibility',
  'uv_index',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'weather_code',
] as const;

const DAILY_FIELDS = [
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
] as const;

/** Coordinate validity check. */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/** Makes the (untrusted) raw JSON from Open-Meteo type-safe. */
function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/**
 * Fetches weather data from Open-Meteo.
 *
 * @throws {Error} on network, timeout or HTTP failures
 */
export async function fetchWeather(
  lat: number,
  lng: number
): Promise<WeatherData> {
  if (!isValidCoordinate(lat, lng)) {
    throw new Error('Invalid coordinates (lat/lng)');
  }

  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    timezone: 'auto',
    forecast_days: '2',
    wind_speed_unit: 'kmh',
  });

  const url = `${OPEN_METEO_URL}?${params.toString()}`;

  // Timeout via AbortController (8 s).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      // Server-side proxy; there is no need for Next to manage the cache.
      cache: 'no-store',
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('The Open-Meteo request timed out (8s)');
    }
    throw new Error(
      `Open-Meteo network error: ${err instanceof Error ? err.message : 'unknown'}`
    );
  } finally {
    clearTimeout(timer);
  }

  if (!resp.ok) {
    throw new Error(`Open-Meteo HTTP ${resp.status}`);
  }

  const raw = (await resp.json()) as Record<string, unknown>;

  return parseWeatherData(raw);
}

/**
 * Converts the raw Open-Meteo JSON into a type-safe `WeatherData`.
 * Kept separate for testability and resilience against malformed data.
 */
function parseWeatherData(raw: Record<string, unknown>): WeatherData {
  const rawCurrent = raw.current as Record<string, unknown> | undefined;
  const rawHourly = raw.hourly as Record<string, unknown> | undefined;
  const rawDaily = raw.daily as Record<string, unknown> | undefined;

  if (!rawCurrent || !rawHourly || !rawDaily) {
    throw new Error('The Open-Meteo response is incomplete (current/hourly/daily)');
  }

  // --- Current ---
  const current: CurrentWeather = {
    time: String(rawCurrent.time ?? ''),
    temperature: num(rawCurrent.temperature_2m),
    feelsLike: num(rawCurrent.apparent_temperature),
    isDaytime: num(rawCurrent.is_day, 1) === 1,
    precipitation: num(rawCurrent.precipitation),
    rain: num(rawCurrent.rain),
    weatherCode: Math.round(num(rawCurrent.weather_code)),
    cloudCover: num(rawCurrent.cloud_cover),
    pressureSeaLevel: num(rawCurrent.pressure_msl),
    pressureSurface: num(rawCurrent.surface_pressure),
    windSpeed: num(rawCurrent.wind_speed_10m),
    windDirection: num(rawCurrent.wind_direction_10m),
    windGust: num(rawCurrent.wind_gusts_10m),
  };

  // --- Saatlik ---
  const hTime = (rawHourly.time as unknown[] | undefined) ?? [];
  const hArr = <T,>(k: string): T[] =>
    (rawHourly[k] as T[] | undefined) ?? [];
  const hourly: HourlyForecast[] = hTime.map((t, i) => ({
    time: String(t),
    temperature: num(hArr<number>('temperature_2m')[i]),
    feelsLike: num(hArr<number>('apparent_temperature')[i]),
    precipitationProbability: num(hArr<number>('precipitation_probability')[i]),
    precipitation: num(hArr<number>('precipitation')[i]),
    cloudCover: num(hArr<number>('cloud_cover')[i]),
    // Open-Meteo reports visibility in metres → convert to km.
    visibility: num(hArr<number>('visibility')[i]) / 1000,
    uvIndex: num(hArr<number>('uv_index')[i]),
    windSpeed: num(hArr<number>('wind_speed_10m')[i]),
    windDirection: num(hArr<number>('wind_direction_10m')[i]),
    windGust: num(hArr<number>('wind_gusts_10m')[i]),
    weatherCode: Math.round(num(hArr<number>('weather_code')[i])),
  }));

  // --- Daily ---
  const dTime = (rawDaily.time as unknown[] | undefined) ?? [];
  const dArr = <T,>(k: string): T[] => (rawDaily[k] as T[] | undefined) ?? [];
  const daily: DailyForecast[] = dTime.map((t, i) => ({
    date: String(t),
    sunrise: String(dArr<string>('sunrise')[i] ?? ''),
    sunset: String(dArr<string>('sunset')[i] ?? ''),
    uvIndexMax: num(dArr<number>('uv_index_max')[i]),
    precipitationProbabilityMax: num(dArr<number>('precipitation_probability_max')[i]),
    windSpeedMax: num(dArr<number>('wind_speed_10m_max')[i]),
    windGustMax: num(dArr<number>('wind_gusts_10m_max')[i]),
  }));

  return {
    current,
    hourly,
    daily,
    timezone: String(raw.timezone ?? ''),
    utcOffsetSn: num(raw.utc_offset_seconds),
  };
}
