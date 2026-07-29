/**
 * GET /api/weather?lat=X&lng=Y
 *
 * Proxies Open-Meteo data on the server, caches it, computes flight
 * suitability and returns type-safe JSON.
 *
 * Security notes:
 *  - The client never talks to Open-Meteo directly; this route is the proxy.
 *  - The request is matched to the nearest `WeatherThreshold` record.
 *  - With no match, the default threshold is tried; failing that, an error.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedWeather } from '@/lib/weather/cache';
import { computeSuitability, thresholdInput } from '@/lib/weather/suitability';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { apiServerError, apiError, safeLog } from '@/lib/api-error';
import type { WeatherThreshold } from '@prisma/client';
import type { WeatherApiResponse, ThresholdView } from '@/lib/weather/types';

// Requires Prisma (the Node runtime), not edge.
export const runtime = 'nodejs';
// Avoid static rendering so each request gets fresh thresholds and data.
export const dynamic = 'force-dynamic';

// =====================================================
// RATE LIMIT (public endpoint: 60 requests / minute / IP)
// =====================================================
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

/** Haversine distance between two points (km). */
function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Prisma `WeatherThreshold` → the client-safe `ThresholdView`. */
function toThresholdView(e: WeatherThreshold): ThresholdView {
  return {
    locationName: e.locationName,
    lat: e.lat,
    lng: e.lng,
    takeoffHeading: e.takeoffHeading,
    windMaxGreen: e.windMaxGreen,
    windMaxAmber: e.windMaxAmber,
    gustDeltaMaxGreen: e.gustDeltaMaxGreen,
    gustDeltaMaxAmber: e.gustDeltaMaxAmber,
    precipMaxGreen: e.precipMaxGreen,
    precipMaxAmber: e.precipMaxAmber,
    visibilityMinGreen: e.visibilityMinGreen,
    visibilityMinAmber: e.visibilityMinAmber,
    windSectorMin: e.windSectorMin ?? null,
    windSectorMax: e.windSectorMax ?? null,
  };
}

/**
 * Finds the nearest active `WeatherThreshold` for a coordinate.
 * Falls back to the default (the first active record) when the database errors
 * or nothing matches.
 */
async function findThreshold(
  lat: number,
  lng: number
): Promise<WeatherThreshold | null> {
  try {
    const activeThresholds = await prisma.weatherThreshold.findMany({
      where: { active: true },
    });

    if (activeThresholds.length === 0) return null;

    // Pick the closest one (Haversine).
    let nearest = activeThresholds[0];
    if (!nearest) return null;
    let smallest = distanceKm(lat, lng, nearest.lat, nearest.lng);
    for (let i = 1; i < activeThresholds.length; i++) {
      const e = activeThresholds[i];
      if (!e) continue;
      const m = distanceKm(lat, lng, e.lat, e.lng);
      if (m < smallest) {
        smallest = m;
        nearest = e;
      }
    }
    return nearest;
  } catch (e) {
    // Fall back quietly when the threshold query fails — but log it.
    safeLog('api/hava:esikBul', e, undefined, 'warn');
    return null;
  }
}

// =====================================================
// HANDLER
// =====================================================

async function weatherGetHandler(
  req: Request
): Promise<NextResponse> {
  const url = new URL(req.url);
  const latRaw = url.searchParams.get('lat');
  const lngRaw = url.searchParams.get('lng');

  // Parameter validation
  if (latRaw == null || lngRaw == null) {
    return apiError('The lat and lng parameters are required.', 400, 'MISSING_PARAM');
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return apiError('Invalid coordinate format.', 400, 'INVALID_COORDINATES');
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return apiError('Coordinates are outside the allowed range.', 400, 'COORDINATES_OUT_OF_RANGE');
  }

  // Resolve the threshold
  const thresholdRow = await findThreshold(lat, lng);
  if (!thresholdRow) {
    return apiError(
      'No weather thresholds are defined for this location. Please contact the administrator.',
      404,
      'NO_THRESHOLD'
    );
  }

  // Weather data (cache + API)
  let cached;
  try {
    cached = await getCachedWeather(lat, lng);
  } catch (err) {
    // Upstream failure: safe log plus a generic message (no internal leak).
    return apiServerError(err, 'api/hava:getCachedHava');
  }

  // Compute suitability against the threshold nearest the requested coordinate
  // (not the threshold's own lat/lng); wind direction is judged against its sector.
  // The suitability sentences are produced in the client's locale (?locale=en).
  const localeParam = url.searchParams.get('locale');
  const locale = localeParam === 'en' ? 'en' : 'tr';
  const suitability = computeSuitability(cached.data.current, thresholdInput(thresholdRow), {
    stale: cached.stale,
    locale,
  });

  const response: WeatherApiResponse = {
    current: cached.data.current,
    hourly: cached.data.hourly,
    daily: cached.data.daily,
    suitability,
    threshold: toThresholdView(thresholdRow),
    lastUpdated: cached.lastUpdated.toISOString(),
    fromSource: cached.fromSource,
    stale: cached.stale,
    timezone: cached.data.timezone,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      // Short client-side cache plus revalidation.
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

/**
 * GET /api/weather?lat=X&lng=Y
 *
 * The public endpoint, wrapped in a rate limit (60/minute/IP).
 */
export const GET = rateLimitMiddleware(weatherGetHandler, {
  limit: RATE_LIMIT,
  windowMs: RATE_WINDOW_MS,
  extraKey: 'hava',
});
