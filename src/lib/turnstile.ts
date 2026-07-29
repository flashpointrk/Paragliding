/**
 * Cloudflare Turnstile — server-side verification helper.
 *
 * Flow (CANONICAL — the browser NEVER calls the Turnstile API directly):
 *   browser → widget produces a token → posts it to the backend
 *   backend → verifies once against
 *             https://challenges.cloudflare.com/turnstile/v0/siteverify
 *             (secret + token + remoteip).
 *
 * Rules that matter:
 *  - The secret is read from the database only (ContactSettings "global").
 *    There is no env fallback.
 *  - Verification is skipped when turnstileEnabled === false.
 *  - In production, an enabled Turnstile with no secret fails closed.
 *  - Tokens are single-use; siteverify is called exactly once.
 *  - On error or timeout the client gets a generic message — no detail leaks.
 */

import { prisma } from '@/lib/prisma';

const GLOBAL_ID = 'global';

/** The Cloudflare siteverify endpoint. */
const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Network timeout for siteverify (ms). */
const VERIFY_TIMEOUT_MS = 8_000;

export interface TurnstileResult {
  /** Did verification succeed (or was it skipped)? */
  successful: boolean;
  /** Failure reason — for logging only; never surfaced to the client. */
  error?: string;
}

/** Reads the Turnstile settings from the ContactSettings "global" row. */
async function turnstileSettings(): Promise<{
  active: boolean;
  secret: string | null;
} | null> {
  try {
    const settings = await prisma.contactSettings.findUnique({
      where: { id: GLOBAL_ID },
      select: {
        turnstileEnabled: true,
        turnstileSecret: true,
      },
    });
    if (!settings) return null;
    return {
      active: settings.turnstileEnabled,
      secret: settings.turnstileSecret?.trim() || null,
    };
  } catch (err) {
    console.error('[turnstile] Failed to read settings:', err);
    return null;
  }
}

/**
 * Verifies a Cloudflare Turnstile token on the server.
 *
 * @param token    The `cf-turnstile-response` token from the client. Null or
 *                 empty fails when Turnstile is enabled.
 * @param clientIp Client IP (remoteip). Optional; adds a little more assurance.
 *
 * @returns { succeeded, error? }
 *
 * Behaviour:
 *  - Turnstile disabled (turnstileEnabled false) → succeeded: true (skip).
 *  - No secret → skip in development, fail in production.
 *  - Enabled + secret + empty token → succeeded: false.
 *  - Enabled + secret + token → siteverify is called.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  clientIp: string | null | undefined
): Promise<TurnstileResult> {
  const settings = await turnstileSettings();

  // Not configured or not enabled → skip.
  if (!settings || !settings.active) {
    return { successful: true };
  }
  if (!settings.secret) {
    const message =
      '[turnstile] turnstileEnabled is true but turnstileSecret is empty — verification is not configured.';
    if (process.env.NODE_ENV === 'production') {
      console.error(message);
      return { successful: false, error: 'Turnstile secret eksik' };
    }
    console.warn(`${message} Skipped in development.`);
    return { successful: true };
  }

  const t = (token ?? '').trim();
  if (!t) {
    return { successful: false, error: 'Token yok' };
  }

  // Canonical siteverify: an application/x-www-form-urlencoded body.
  const params = new URLSearchParams();
  params.append('secret', settings.secret);
  params.append('response', t);
  if (clientIp && clientIp !== 'bilinmiyor') {
    params.append('remoteip', clientIp);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

    const resp = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: params,
      signal: controller.signal,
      // No caching — every token is single-use.
      cache: 'no-store',
    }).finally(() => clearTimeout(timer));

    if (!resp.ok) {
      console.error(
        `[turnstile] siteverify returned HTTP ${resp.status}`
      );
      return { successful: false, error: `siteverify HTTP ${resp.status}` };
    }

    const data = (await resp.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    if (data.success === true) {
      return { successful: true };
    }

    const codes = data['error-codes']?.join(', ') ?? 'unknown';
    console.warn('[turnstile] Verification failed:', codes);
    return { successful: false, error: `error-codes: ${codes}` };
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'siteverify timeout'
        : err instanceof Error
          ? err.message
          : String(err);
    console.error('[turnstile] siteverify request failed:', message);
    return { successful: false, error: message };
  }
}
