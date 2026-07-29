import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';
import { safeLog } from '@/lib/api-error';

/**
 * NextAuth route handler.
 *
 * Security:
 *  - The persistent (Postgres) brute-force lock is applied inside `authorize`
 *    (src/lib/auth-security.ts).
 *  - An in-memory rate limit is layered on here: at most 10 requests per minute
 *    per IP to the credential sign-in endpoint
 *    (/api/auth/callback/credentials). That is a cheap first line of defence
 *    that stops fast floods before they ever reach Postgres.
 *
 * Only the `callback/credentials` path is rate limited; the other NextAuth
 * endpoints (csrf token, session, providers) are untouched.
 */

// Credentials sign-in: 10 requests per minute per IP.
const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 60_000;

const authHandler = NextAuth(authOptions);

async function GET(...args: Parameters<typeof authHandler>) {
  return authHandler(...args);
}

async function POST(
  req: Request,
  ctx: { params: { nextauth: string[] } }
): Promise<Response> {
  const path = (ctx.params?.nextauth ?? []).join('/');

  // Only the credential callback is rate limited.
  if (path.includes('callback/credentials')) {
    const ip = getClientIp(req);
    const rl = rateLimit(`auth-login:${ip}`, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS);
    if (!rl.allowed) {
      const headers = rateLimitHeaders(rl, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS);
      safeLog(
        'api/auth:login-rate-limit',
        `IP rate limit exceeded (${LOGIN_RATE_LIMIT}/${LOGIN_RATE_WINDOW_MS / 1000}s)`,
        undefined,
        'warn'
      );
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Too many sign-in attempts. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          retryAfterSeconds: Math.ceil(rl.retryAfterMs / 1000),
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...headers },
        }
      );
    }
  }

  return authHandler(req, ctx);
}

export { GET, POST };
