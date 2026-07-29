/**
 * Login lock status endpoint.
 *
 * After a failed attempt LoginForm GETs this endpoint to find out whether the
 * user is locked out, and reports the brute-force information (the time
 * remaining) by e-mail address. The client cannot supply an IP, so only the
 * e-mail-based state is returned; the IP lock is enforced inside `authorize`.
 *
 * Security note: to avoid confirming that an e-mail exists, an endpoint like
 * this can always answer "locked: false". Here the lock state is reported
 * openly for the sake of the user experience — signing in already requires both
 * an e-mail and a password, and the user has just typed their own address.
 */

import { NextResponse } from 'next/server';
import { ipAl, isLoginLocked } from '@/lib/auth-security';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { locked: false, attemptsLeft: null, retryDelayMs: null },
      { status: 200 }
    );
  }

  try {
    const ip = await ipAl();
    const status = await isLoginLocked(email, ip);
    return NextResponse.json(
      {
        locked: status.locked,
        attemptsLeft: status.attemptsLeft,
        retryDelayMs: status.retryDelayMs ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('lock-check failed:', err);
    return NextResponse.json(
      { locked: false, attemptsLeft: null, retryDelayMs: null },
      { status: 200 }
    );
  }
}
