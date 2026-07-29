/**
 * Admin session and role helpers.
 *
 * Used from server components and route handlers. Reads the NextAuth JWT
 * session and either returns the user or redirects to the sign-in page.
 *
 * Role hierarchy:
 *  - OPERATOR: manages bookings and content
 *  - ADMIN: everything OPERATOR can do, plus user management and weather
 *    thresholds
 *
 * CSRF integration:
 *  `apiRequireStaff`/`apiRequireAdmin` take an optional `request` parameter.
 *  For state-changing requests (POST/PUT/DELETE) they run the Origin/Referer
 *  check via `checkCsrf`; GET is skipped as a safe method. That applies CSRF
 *  protection to every admin route from one place, rather than repeating it in
 *  each handler.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCsrf } from '@/lib/csrf';

/** Type-safe session user for the server side. */
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'ADMIN' | 'OPERATOR';
}

/**
 * Returns the active session, or null when there is none.
 * Safe to use from server components.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return null;
  }
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

/**
 * Requires any signed-in user.
 * Redirects to `/login` when there is no session.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Requires the ADMIN or OPERATOR role (staff).
 * Redirects to `/login` when unauthorized.
 */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'OPERATOR')) {
    redirect('/login');
  }
  return user;
}

/**
 * Requires the ADMIN role.
 * Redirects to `/login` when unauthorized.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }
  return user;
}

/**
 * For API route handlers: the user when a session exists, null otherwise.
 * (Returns null instead of redirecting so the handler can answer 401/403.)
 */
export async function apiGetSessionUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

/**
 * Staff check for API route handlers.
 * May answer 401 (not signed in) or 403 (insufficient role / invalid CSRF).
 * Returns the user on success.
 *
 * @param request Optional. When supplied, state-changing requests
 *                (POST/PUT/DELETE) go through the Origin/Referer CSRF check;
 *                GET is skipped as a safe method. This gives every admin write
 *                route CSRF protection from a single place.
 */
export async function apiRequireStaff(
  request?: Request
): Promise<
  { ok: true; user: SessionUser } | { ok: false; status: number; message: string }
> {
  if (request) {
    const csrf = checkCsrf(request);
    if (!csrf.valid) {
      console.warn('[admin-auth] CSRF reddedildi:', csrf.reason);
      return { ok: false, status: 403, message: 'The request could not be verified.' };
    }
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, status: 401, message: 'You need to sign in.' };
  }
  if (user.role !== 'ADMIN' && user.role !== 'OPERATOR') {
    return { ok: false, status: 403, message: 'You do not have permission for this action.' };
  }
  return { ok: true, user };
}

/**
 * Admin check for API route handlers.
 * May answer 401 (not signed in) or 403 (not an admin / invalid CSRF).
 *
 * @param request Optional. When supplied, state-changing requests
 *                (POST/PUT/DELETE) go through the Origin/Referer CSRF check;
 *                GET is skipped.
 */
export async function apiRequireAdmin(
  request?: Request
): Promise<
  { ok: true; user: SessionUser } | { ok: false; status: number; message: string }
> {
  if (request) {
    const csrf = checkCsrf(request);
    if (!csrf.valid) {
      console.warn('[admin-auth] CSRF reddedildi:', csrf.reason);
      return { ok: false, status: 403, message: 'The request could not be verified.' };
    }
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, status: 401, message: 'You need to sign in.' };
  }
  if (user.role !== 'ADMIN') {
    return { ok: false, status: 403, message: 'This action requires the ADMIN role.' };
  }
  return { ok: true, user };
}
