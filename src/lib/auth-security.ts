/**
 * Login security layer — brute-force protection.
 *
 * Strategy: NextAuth's `/api/auth/callback/credentials` endpoint cannot be
 * intercepted, so attempts are tracked inside `authorize` and persisted through
 * Prisma (LoginAttempt). The locking rule is:
 *
 *   five failed attempts for the same e-mail OR IP within 15 minutes
 *   -> a 15 minute lock.
 *
 * While a lock is in force every attempt from the affected key is rejected
 * early in `authorize` (returning null), producing the generic "invalid
 * credentials" error. LoginForm surfaces the remaining time through the
 * `error=lock` query parameter.
 *
 * Note: this is NOT an in-process limit — it is persisted in Postgres, so it
 * survives restarts and multiple instances.
 */

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/** Window and lock parameters. */
export const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 dakika
export const LOGIN_MAX_FAILURES = 5; // max failed attempts allowed inside the window
export const LOGIN_LOCK_MS = 15 * 60 * 1000; // lock duration

/** Placeholder used for an unknown IP. */
export const IP_UNKNOWN = 'bilinmiyor';

export interface LoginLockState {
  /** Kilitli mi? */
  locked: boolean;
  /** Attempts left (when not locked). */
  attemptsLeft: number;
  /** How long to wait before retrying (ms). Undefined when not locked. */
  retryDelayMs?: number;
}

/**
 * Safely extracts the client IP through `next/headers`. Used from App Router
 * server components and inside the NextAuth `authorize` callback.
 *
 * Order: `X-Forwarded-For` (first entry) -> `X-Real-IP` -> placeholder.
 *
 * Behind the Caddy reverse proxy both `X-Forwarded-For` and `X-Real-IP` are
 * populated (see the Caddyfile).
 */
export async function ipAl(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded && forwarded.length > 0) {
    // "client, proxy1, proxy2" -> ilk eleman
    const ilk = forwarded.split(',')[0]?.trim();
    if (ilk) return ilk;
  }
  const realIp = headerList.get('x-real-ip');
  if (realIp && realIp.length > 0) return realIp.trim();

  return IP_UNKNOWN;
}

/**
 * Records a login attempt through Prisma.
 * Both successes and failures are recorded (auditing plus brute-force).
 */
export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  successful: boolean
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        email: email.toLowerCase(),
        ip,
        successful,
      },
    });
  } catch (err) {
    // A write failure must not break the login flow; just log it.
    console.error('Failed to record the login attempt:', err);
  }
}

/**
 * Returns the lock state for an e-mail OR an IP.
 *
 * How it works:
 *  - Count the failed attempts within LOGIN_WINDOW_MS (e-mail and IP
 *    separately).
 *  - If either key reaches LOGIN_MAX_FAILURES, treat it as locked.
 *  - The lock runs for LOGIN_LOCK_MS from the most recent failed attempt.
 *
 * `attemptsLeft`: what remains on the key that did not trigger the lock (when
 * unlocked, the smaller of the two).
 */
export async function isLoginLocked(
  email: string,
  ip: string | null
): Promise<LoginLockState> {
  const now = Date.now();
  const windowStart = new Date(now - LOGIN_WINDOW_MS);

  // Recent failures for this e-mail
  const emailFailures = await prisma.loginAttempt.findMany({
    where: {
      email: email.toLowerCase(),
      successful: false,
      occurredAt: { gte: windowStart },
    },
    orderBy: { occurredAt: 'desc' },
    take: LOGIN_MAX_FAILURES,
  });

  // Recent failures for this IP (when the IP is known)
  const ipFailures =
    ip && ip !== IP_UNKNOWN
      ? await prisma.loginAttempt.findMany({
          where: {
            ip,
            successful: false,
            occurredAt: { gte: windowStart },
          },
          orderBy: { occurredAt: 'desc' },
          take: LOGIN_MAX_FAILURES,
        })
      : [];

  const emailCount = emailFailures.length;
  const ipCount = ipFailures.length;

  // Work out whether it is locked, and which key is most constrained
  const emailLocked = emailCount >= LOGIN_MAX_FAILURES;
  const ipLocked = ipCount >= LOGIN_MAX_FAILURES;

  if (emailLocked || ipLocked) {
    // Find the latest failed attempt (the newer of the two sources)
    const enSonEmail = emailLocked
      ? (emailFailures[0]?.occurredAt.getTime() ?? 0)
      : 0;
    const enSonIp = ipLocked ? (ipFailures[0]?.occurredAt.getTime() ?? 0) : 0;
    const enSonMs = Math.max(enSonEmail, enSonIp);

    if (enSonMs > 0) {
      const retryDelayMs = Math.max(
        0,
        enSonMs + LOGIN_LOCK_MS - now
      );
      // Still inside the lock window means locked
      if (retryDelayMs > 0) {
        return {
          locked: true,
          attemptsLeft: 0,
          retryDelayMs,
        };
      }
    }
  }

  // Not locked — derive the attempts left from the most constrained key
  const emailRemaining = Math.max(0, LOGIN_MAX_FAILURES - emailCount);
  const ipRemaining = Math.max(0, LOGIN_MAX_FAILURES - ipCount);
  const attemptsLeft = Math.min(emailRemaining, ipRemaining);

  return {
    locked: false,
    attemptsLeft,
  };
}
