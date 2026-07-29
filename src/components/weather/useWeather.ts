'use client';

/**
 * React hook that fetches weather data from the `/api/weather` endpoint.
 *
 * Handles automatic refetching (polling) plus the error and loading states.
 * Stale data (>15 min) is also detected client-side, so the badge downgrades
 * itself in tabs that stay open for a long time.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WeatherApiResponse, WeatherApiError } from '@/lib/weather/types';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { translateError } from '@/lib/i18n/errors';

const STALE_MS = 15 * 60 * 1000;
/** Minimum gap between two fetches when returning to the tab. */
const FOCUS_MIN_INTERVAL_MS = 60 * 1000;

export interface UseWeatherResult {
  data: WeatherApiResponse | null;
  loading: boolean;
  error: string | null;
  /** Is the data cached or stale? */
  stale: boolean;
  refetch: () => void;
}

/**
 * @param lat       latitude
 * @param lng       longitude
 * @param refreshMs automatic refetch interval (defaults to 5 min)
 */
export function useWeather(
  lat: number,
  lng: number,
  refreshMs = 5 * 60 * 1000
): UseWeatherResult {
  const [data, setVeri] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  const { s: sz, locale } = useDictionary();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(0);

  const load = useCallback(async () => {
    lastFetchRef.current = Date.now();
    setLoading((previous) => previous || true);
    try {
      const resp = await fetch(
        `/api/weather?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&locale=${locale}`,
        { cache: 'no-store' }
      );
      if (!resp.ok) {
        let message = `${sz.weather.serverError} (${resp.status})`;
        try {
          const errJson = (await resp.json()) as WeatherApiError;
          if (errJson?.error) message = translateError(locale, errJson.error);
        } catch {
          /* yok say */
        }
        throw new Error(message);
      }
      const json = (await resp.json()) as WeatherApiResponse;
      if (!mountedRef.current) return;
      setVeri(json);
      setError(null);
      setStale(Boolean(json.stale));
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : sz.weather.unknownError);
      // Keep the old data but flag it as stale
      setStale(true);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [lat, lng, locale, sz]);

  // First load plus polling
  useEffect(() => {
    mountedRef.current = true;
    load();
    intervalRef.current = setInterval(load, refreshMs);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load, refreshMs]);

  // Refresh on returning to the tab. Browsers throttle setInterval in
  // background tabs, so the data on screen can quietly go stale.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchRef.current < FOCUS_MIN_INTERVAL_MS) return;
      load();
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [load]);

  // Staleness check: lastUpdated older than 15 min → stale
  useEffect(() => {
    if (!data) return;
    const t = new Date(data.lastUpdated).getTime();
    if (!Number.isFinite(t)) return;
    const check = setInterval(() => {
      if (Date.now() - t > STALE_MS) {
        setStale(true);
      }
    }, 60 * 1000);
    return () => clearInterval(check);
  }, [data]);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  return { data, loading, error, stale, refetch };
}
