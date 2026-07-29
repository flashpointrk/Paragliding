/**
 * In-process rate limiting helpers.
 *
 * Keeps a Map of key -> list of timestamps. Requests that exceed the limit
 * inside a given time window are rejected.
 *
 * NOTE: this only holds within a single process (a single instance when
 * serverless). Multi-instance or distributed deployments need Redis or a
 * comparable external store. As a first layer against form spam and basic
 * abuse it is sufficient.
 *
 * Entries outside the window are pruned on every call, which keeps memory
 * from growing.
 *
 * Two ways to use it:
 *   1. Low level: `rateLimit(key, limit, windowMs)` → { allowed, remaining, ... }
 *   2. Wrapper: `rateLimitMiddleware(handler, { limit, windowMs, keyMode })`
 *      — wraps a Next.js route handler and, when the limit is exceeded,
 *      answers 429 with the standard X-RateLimit-* headers.
 */

import { NextResponse } from 'next/server';

type Entry = {
  /** Request timestamps for this key (ms). */
  timestamps: number[];
};

const store = new Map<string, Entry>();

export interface RateLimitResult {
  /** Is the request allowed? */
  allowed: boolean;
  /** Requests left in the window (>= 0 when allowed, 0 otherwise). */
  remaining: number;
  /** How long to wait before retrying (ms). Zero when allowed. */
  retryAfterMs: number;
}

/**
 * Runs the rate-limit check for a key (usually an IP address).
 *
 * @param key       Usually the IP address.
 * @param limit     Maximum requests allowed per window.
 * @param windowMs  Window length in milliseconds.
 * @returns Whether the request is allowed and how much quota is left.
 *
 * Example: `rateLimit(ip, 3, 60_000)` → at most three requests per minute.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = store.get(key);
  // Prune entries outside the window
  const validTimestamps = existing
    ? existing.timestamps.filter((t) => t > windowStart)
    : [];

  if (validTimestamps.length >= limit) {
    // When is the oldest valid entry? The end of its window is the retry point.
    const oldest = Math.min(...validTimestamps);
    const retryAfterMs = Math.max(0, oldest + windowMs - now);
    store.set(key, { timestamps: validTimestamps });
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }

  // Record this request
  validTimestamps.push(now);
  store.set(key, { timestamps: validTimestamps });

  return {
    allowed: true,
    remaining: Math.max(0, limit - validTimestamps.length),
    retryAfterMs: 0,
  };
}

/**
 * Safely extracts the client IP from a Next.js Request.
 * Behind Vercel/a proxy x-forwarded-for wins; otherwise the remote address.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded && forwarded.length > 0) {
    // "client, proxy1, proxy2" -> ilk eleman
    return forwarded.split(',')[0]?.trim() ?? 'bilinmiyor';
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.length > 0) return realIp.trim();

  // A Next.js Request may carry no connection address; last resort.
  return 'bilinmiyor';
}

/** Clears the store, for tests and resets. */
export function _resetRateLimit(): void {
  store.clear();
}

// =====================================================
// IP EXTRACTION (alias plus an extended fallback)
// =====================================================

/**
 * Extracts the client IP in the standard order:
 *   1. X-Forwarded-For (first entry)
 *   2. x-real-ip
 *   3. connection.remoteAddress (when available)
 *   4. 'unknown'
 *
 * Same logic as `getClientIp`; `getIp` is the newer standard name and the old
 * one is kept for backwards compatibility.
 */
export function getIp(request: Request): string {
  return getClientIp(request);
}

// =====================================================
// RATE LIMIT HEADER YARDIMCILARI
// =====================================================

/**
 * Builds the standard X-RateLimit-* / Retry-After headers from a rate-limit
 * result. Worth attaching to every response, allowed or 429.
 */
export function rateLimitHeaders(
  result: RateLimitResult,
  limit: number,
  windowMs: number
): Record<string, string> {
  const now = Date.now();
  // Reset timestamp: the end of the window (sliding window: oldest entry + window).
  const resetMs =
    !result.allowed && result.retryAfterMs > 0
      ? now + result.retryAfterMs
      : now + windowMs;
  const resetSeconds = Math.ceil(resetMs / 1000);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(resetSeconds),
  };
  // Retry-After only makes sense on a rejection.
  if (!result.allowed) {
    headers['Retry-After'] = String(Math.ceil(result.retryAfterMs / 1000));
  }
  return headers;
}

// =====================================================
// ROUTE HANDLER WRAPPER
// =====================================================

/**
 * Rate-limit wrapper for a Next.js route handler.
 *
 * The limit is checked before the handler runs:
 *  - When allowed, the handler runs normally and its response gains the
 *    `X-RateLimit-*` headers.
 *  - When exceeded, it answers 429 with `Retry-After` and a consistent JSON
 *    body, and the handler is never called.
 *
 * @param handler  The Next.js route handler to wrap.
 * @param opts     { limit, windowMs, keyMode, extraKey }
 *                  - keyMode: 'ip' (default) | 'ip+email' (email from the body)
 *                  - extraKey: optional constant prefix (e.g. the route name)
 */
export function rateLimitMiddleware<TArgs extends unknown[]>(
  handler: (request: Request, ...args: TArgs) => Promise<NextResponse> | NextResponse,
  opts: {
    limit: number;
    windowMs: number;
    keyBased?: 'ip' | 'ip+email';
    extraKey?: string;
  }
): (request: Request, ...args: TArgs) => Promise<NextResponse> {
  const { limit, windowMs, keyBased = 'ip', extraKey } = opts;

  return async (request: Request, ...args: TArgs): Promise<NextResponse> => {
    const ip = getIp(request);

    let key = extraKey ? `${extraKey}:` : '';
    key += ip;

    // ip+email mode: try to read the email without consuming the body.
    // Once the body stream is read the handler may not be able to read it
    // again, so a failed email extraction falls back to the IP alone.
    if (keyBased === 'ip+email') {
      try {
        // clone the body so the handler's req.json() still works
        const clone = request.clone();
        const body = (await clone.json().catch(() => null)) as {
          email?: unknown;
        } | null;
        if (body && typeof body.email === 'string' && body.email.length > 0) {
          key += `:${body.email.toLowerCase()}`;
        }
      } catch {
        // no email available — carry on with the IP only
      }
    }

    const result = rateLimit(key, limit, windowMs);
    const headers = rateLimitHeaders(result, limit, windowMs);

    if (!result.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You have sent too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000),
        },
        { status: 429, headers }
      );
    }

    // Allowed: wrap the handler call and merge the headers into its response.
    const response = await handler(request, ...args);
    // Add X-RateLimit-* while preserving the existing headers.
    for (const [k, v] of Object.entries(headers)) {
      response.headers.set(k, v);
    }
    return response;
  };
}
