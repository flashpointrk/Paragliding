/**
 * Shared types for the `/api/weather` response, as consumed by the client.
 *
 * They keep the server and the client type-safe against each other.
 */

import type { CurrentWeather, HourlyForecast, DailyForecast } from './open-meteo';
import type { SuitabilityResult } from './suitability';

/** The client-safe view of the threshold information. */
export interface ThresholdView {
  locationName: string;
  lat: number;
  lng: number;
  takeoffHeading: number;
  windMaxGreen: number;
  windMaxAmber: number;
  gustDeltaMaxGreen: number;
  gustDeltaMaxAmber: number;
  precipMaxGreen: number;
  precipMaxAmber: number;
  visibilityMinGreen: number;
  visibilityMinAmber: number;
  windSectorMin: number | null;
  windSectorMax: number | null;
}

/** A successful `/api/weather` response. */
export interface WeatherApiResponse {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  suitability: SuitabilityResult;
  threshold: ThresholdView;
  lastUpdated: string; // ISO
  fromSource: 'cache' | 'api';
  /** Did the data come from the cache, and is it stale? */
  stale: boolean;
  timezone: string;
}

/** An error response from `/api/weather`. */
export interface WeatherApiError {
  error: string;
  code: string;
}
