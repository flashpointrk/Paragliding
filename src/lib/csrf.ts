/**
 * CSRF protection — SameSite cookies plus an Origin/Referer check.
 *
 * Because NextAuth credentials are in play, the classic double-submit cookie
 * approach gets awkward. Instead this relies on the browser's same-origin
 * policy through the "Origin/Referer header validation" pattern recommended by
 * OWASP.
 *
 * The rule for state-changing requests (POST/PUT/DELETE/PATCH):
 *  1. If an `Origin` header is present → compare it with our own host. REJECT
 *     on a mismatch.
 *  2. With no `Origin`, check the `Referer` header (same-origin).
 *  3. With neither → REJECT the state-changing request (GET/HEAD/OPTIONS are
 *     skipped).
 *
 * The list of permitted hosts is derived from `NEXTAUTH_URL` /
 * `NEXT_PUBLIC_SITE_URL`, which also covers temporary domains such as ngrok or
 * a staging host.
 *
 * Note: the NextAuth route (/api/auth/*) must be left alone — it has its own
 * CSRF mechanism.
 */

export interface CsrfResult {
  /** Is the request valid? */
  valid: boolean;
  /** Why it was rejected (for logging/errors). */
  reason?: string;
}

/** State-changing (write) HTTP methods. */
const WRITE_METHODS = new Set([
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

/**
 * Extracts "host[:port]" from a URL string, lower-cased. Returns null when the
 * input is not a valid URL.
 *
 * Examples:
 *  "https://example.com/foo"   -> "example.com"
 *  "https://example.com:3000"  -> "example.com:3000"
 *  "http://localhost:3000/x"   -> "localhost:3000"
 */
export function parseHost(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    // host: includes the port (unlike hostname)
    return u.host.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Compares two host strings (host plus port), case-insensitively.
 */
export function isSameHost(host1: string, host2: string): boolean {
  return host1.toLowerCase() === host2.toLowerCase();
}

/**
 * Returns the list of permitted (own) hosts.
 *
 * Sources:
 *  - NEXT_PUBLIC_SITE_URL
 *  - NEXTAUTH_URL
 *  - The host of the incoming request URL (dynamic — covers ngrok and friends)
 *
 * Falls back to the request URL when the list would otherwise be empty.
 */
function allowedHosts(requestUrl: string): string[] {
  const set = new Set<string>();
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? '';
  if (envUrl) {
    const h = parseHost(envUrl);
    if (h) set.add(h);
  }
  // The request URL always counts as "our own" host, even behind a proxy.
  const requestHost = parseHost(requestUrl);
  if (requestHost) set.add(requestHost);
  return [...set];
}

/**
 * Runs the CSRF check.
 *
 * GET/HEAD/OPTIONS requests are always considered valid (safe methods).
 * State-changing requests go through the Origin/Referer check.
 *
 * @param request Next.js route handler Request object.
 * @returns { valid, reason? }
 *
 * Usage:
 * ```ts
 * const csrf = checkCsrf(req);
 * if (!csrf.valid) {
 *   return NextResponse.json({ ok: false, message: '...' }, { status: 403 });
 * }
 * ```
 */
export function checkCsrf(request: Request): CsrfResult {
  const method = request.method.toUpperCase();

  // Safe methods — no CSRF check needed.
  if (!WRITE_METHODS.has(method)) {
    return { valid: true };
  }

  // The request URL (usually the full route URL).
  const requestUrl = request.url;
  const allowedList = allowedHosts(requestUrl);

  // If no permitted host could be determined at all (an odd situation) and
  // not even the request URL yielded one, stay strict rather than lenient:
  // Origin/Referer is still checked and a mismatch is rejected.

  // 1) The Origin header — the most reliable CSRF signal.
  const origin = request.headers.get('origin');
  if (origin) {
    const originHost = parseHost(origin);
    if (!originHost) {
      return { valid: false, reason: 'Invalid Origin header' };
    }
    if (allowedList.length === 0) {
      // With an empty allow-list, at least compare against the request host.
      const requestHost = parseHost(requestUrl);
      if (!requestHost || !isSameHost(originHost, requestHost)) {
        return {
          valid: false,
          reason: `Origin did not match (empty allow list): ${originHost}`,
        };
      }
      return { valid: true };
    }
    const match = allowedList.some((h) => isSameHost(h, originHost));
    if (!match) {
      return {
        valid: false,
        reason: `Origin host is not allowed: ${originHost}`,
      };
    }
    return { valid: true };
  }

  // 2) No Origin, so fall back to the Referer header.
  const referer = request.headers.get('referer');
  if (referer) {
    const refererHost = parseHost(referer);
    if (!refererHost) {
      return { valid: false, reason: 'Invalid Referer header' };
    }
    if (allowedList.length === 0) {
      const requestHost = parseHost(requestUrl);
      if (!requestHost || !isSameHost(refererHost, requestHost)) {
        return {
          valid: false,
          reason: `Referer did not match (empty allow list): ${refererHost}`,
        };
      }
      return { valid: true };
    }
    const match = allowedList.some((h) => isSameHost(h, refererHost));
    if (!match) {
      return {
        valid: false,
        reason: `Referer host is not allowed: ${refererHost}`,
      };
    }
    return { valid: true };
  }

  // 3) Neither Origin nor Referer — reject the state-changing request.
  return {
    valid: false,
    reason: 'State-changing istekte Origin/Referer header yok',
  };
}
