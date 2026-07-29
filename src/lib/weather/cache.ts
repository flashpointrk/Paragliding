/**
 * Simple in-memory cache layer for weather data.
 *
 * Strategy:
 *  - Current conditions change quickly → 10 min TTL
 *  - The hourly forecast is steadier → 60 min TTL
 *  - A cached entry counts as fresh against the SHORTER of the two TTLs
 *    (10 min), so `current` is always fresh.
 *  - When the API fails the last successful payload is returned as "stale",
 *    with its age exposed through `lastUpdated`.
 *
 * Note: the module-level Map persists inside the Next.js server process (Node
 * runtime). On serverless/edge it may reset on every scale event, which is
 * acceptable — it only costs extra cache misses.
 */

import { fetchWeather, type WeatherData } from './open-meteo';

// =====================================================
// TYPES
// =====================================================

export type DataSource = 'cache' | 'api';

export interface CachedWeatherResult {
  data: WeatherData;
  fromSource: DataSource;
  lastUpdated: Date;
  /** Did the data come from the cache? (cache hit) */
  stale: boolean;
}

interface CacheEntry {
  data: WeatherData;
  time: number; // epoch ms (when the data was produced)
}

// =====================================================
// CONSTANTS
// =====================================================

// The Open-Meteo `current` block refreshes every 15 min; a 5 min TTL picks
// up each new reading promptly (~288 requests/day per location).
const CURRENT_TTL_MS = 5 * 60 * 1000; // 5 dakika
const HOURLY_TTL_MS = 60 * 60 * 1000; // 60 dakika
/** Data older than this is flagged "stale" (15 min). */
export const STALE_THRESHOLD_MS = 15 * 60 * 1000;

// =====================================================
// CACHE (module level)
// =====================================================

const cache = new Map<string, CacheEntry>();
/** Parallel fetches for the same key are collapsed into one. */
const inFlight = new Map<string, Promise<WeatherData>>();

function key(lat: number, lng: number): string {
  // Three decimals ≈ 110 m precision, which is enough to key the cache.
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/**
 * Returns cached data for a coordinate while it is still fresh, and `null`
 * when it is stale or missing.
 */
function fetchFresh(lat: number, lng: number): CacheEntry | null {
  const k = key(lat, lng);
  const entry = cache.get(k);
  if (!entry) return null;
  const yasMs = Date.now() - entry.time;
  if (yasMs > CURRENT_TTL_MS) return null; // not fresh enough for `current`
  return entry;
}

/**
 * Returns the last successful payload for a coordinate regardless of freshness.
 * Used to answer "stale" when the API is down.
 */
function lastSuccessfulFetch(lat: number, lng: number): CacheEntry | null {
  const k = key(lat, lng);
  return cache.get(k) ?? null;
}

/**
 * Fetches weather data through the cache/API combination.
 *
 * Flow:
 *  1. Fresh cache entry → return it (`fromSource: 'cache'`).
 *  2. Otherwise fetch from the API (parallel requests deduplicated) and cache.
 *  3. If the API fails → return the last successful entry as `stale`.
 *  4. With no data at all → throw.
 */
export async function getCachedWeather(
  lat: number,
  lng: number
): Promise<CachedWeatherResult> {
  // 1) Fresh cache
  const fresh = fetchFresh(lat, lng);
  if (fresh) {
    return {
      data: fresh.data,
      fromSource: 'cache',
      lastUpdated: new Date(fresh.time),
      stale: false,
    };
  }

  // 2) Fetch from the API (in-flight dedup)
  let data: WeatherData;
  let fromSource: DataSource = 'api';
  try {
    data = await fetchDedup(lat, lng);
    const now = Date.now();
    cache.set(key(lat, lng), { data, time: now });
    return {
      data,
      fromSource: fromSource,
      lastUpdated: new Date(now),
      stale: false,
    };
  } catch (err) {
    // 3) Stale fallback
    const son = lastSuccessfulFetch(lat, lng);
    if (son) {
      const yasMs = Date.now() - son.time;
      return {
        data: son.data,
        fromSource: 'cache',
        lastUpdated: new Date(son.time),
        stale: yasMs > STALE_THRESHOLD_MS,
      };
    }
    // 4) No data at all
    throw err;
  }
}

/** Collapses concurrent fetches for the same key into a single promise. */
function fetchDedup(lat: number, lng: number): Promise<WeatherData> {
  const k = key(lat, lng);
  const existing = inFlight.get(k);
  if (existing) return existing;
  const p = fetchWeather(lat, lng).finally(() => {
    inFlight.delete(k);
  });
  inFlight.set(k, p);
  return p;
}

/**
 * "Long" cache lookup that applies a separate TTL for the hourly forecast.
 * (For future lightweight clients that only need the hourly data.)
 */
export function isHourlyFresh(lat: number, lng: number): boolean {
  const k = key(lat, lng);
  const entry = cache.get(k);
  if (!entry) return false;
  return Date.now() - entry.time < HOURLY_TTL_MS;
}

/** Clears the cache, for tests and maintenance. */
export function clearCache(): void {
  cache.clear();
  inFlight.clear();
}
