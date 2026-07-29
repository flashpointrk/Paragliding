import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingSchema } from '@/lib/booking/schema';
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/csrf';
import { verifyTurnstile } from '@/lib/turnstile';
import {
  apiError,
  apiServerError,
  apiValidationError,
  safeLog,
  checkBodySize,
} from '@/lib/api-error';

/**
 * POST /api/booking
 *
 * Creates a new flight request (booking).
 *
 * Flow:
 *  0. CSRF check (Origin/Referer same-origin)
 *  1. Rate limit (per IP, 3/minute)
 *  2. Cloudflare Turnstile verification (canonical siteverify)
 *  3. Body validation (Zod) plus the honeypot check
 *  4. Confirm the package exists and is active
 *  5. Write the Booking row (status: PENDING) and the first status history entry
 *  6. E-mail: acknowledgement to the customer, notification to the admin
 *     (console when SMTP is absent)
 *  7. Response: { ok: true, id } | { ok: false, errors }
 *
 * There is NO payment — this endpoint only records a request.
 *
 * Admin operations (listing, status updates) live in their own endpoints under
 * /api/admin/booking/*; this route is exclusively the public request form.
 *
 * Note: if the e-mail fails after the row is written the request still counts
 * as successful and the client gets a warning.
 */

// Rate limit: three requests per minute per IP
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60_000;
// Maximum body size for a booking (100 KB).
const MAX_BODY_BYTES = 100 * 1024;

export async function POST(req: Request) {
  // --- 0. CSRF check (Origin/Referer same-origin) ---
  const csrf = checkCsrf(req);
  if (!csrf.valid) {
    safeLog('api/booking:csrf', csrf.reason, undefined, 'warn');
    return apiError('The request could not be verified.', 403, 'CSRF_INVALID');
  }

  // --- 1. Rate limit (per IP, 3/minute) ---
  const ip = getClientIp(req);
  const rl = rateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS);
  const rlHeaders = rateLimitHeaders(rl, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'You have sent too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
        retryAfterSeconds: Math.ceil(rl.retryAfterMs / 1000),
      },
      { status: 429, headers: rlHeaders }
    );
  }

  // --- 2. Cloudflare Turnstile (after the rate limit, before Zod) ---
  // Body size check plus JSON parse (the stream is consumed once).
  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  // Read the token out of the body safely (raw read, before Zod).
  const turnstileToken =
    typeof body === 'object' && body !== null
      ? (body as { turnstileToken?: unknown }).turnstileToken
      : undefined;
  const tokenStr =
    typeof turnstileToken === 'string' ? turnstileToken : null;

  const ts = await verifyTurnstile(tokenStr, ip);
  if (!ts.successful) {
    // Reject an invalid token unless Turnstile is disabled. Leak no detail.
    return NextResponse.json(
      {
        ok: false,
        errors: { turnstileToken: 'Security verification is required.' },
        error: 'Security verification failed.',
      },
      { status: 400 }
    );
  }

  // --- 3. Zod validation (the body was parsed above) ---
  const result = bookingSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  const data = result.data;

  // Extra honeypot guard (the schema checks it too — belt and braces)
  if (data.honeypot && data.honeypot.length > 0) {
    // Bot detected — answer 200 quietly but store nothing, so the bot cannot tell
    return NextResponse.json({ ok: true, id: 'spam-ignored' });
  }

  // --- 4. Package validation ---
  let pkg;
  try {
    pkg = await prisma.package.findFirst({
      where: { id: data.packageId, active: true },
    });
  } catch (err) {
    return apiServerError(err, 'api/booking:paketSorgu');
  }

  if (!pkg) {
    return NextResponse.json(
      {
        ok: false,
        errors: { packageId: 'The selected package was not found or is not active.' },
        message: 'The package selection is not valid.',
      },
      { status: 422 }
    );
  }

  // --- 5. Write the booking ---
  let booking;
  try {
    booking = await prisma.booking.create({
      data: {
        packageId: pkg.id,
        preferredDate: new Date(data.preferredDate),
        alternateDate: data.alternateDate
          ? new Date(data.alternateDate)
          : null,
        preferredTime: data.preferredTime ?? null,
        guestCount: data.guestCount,
        weightRange: data.weightRange,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email.toLowerCase(),
        locale: data.locale,
        transferRequested: data.transferRequested,
        mediaPreference: data.mediaPreference,
        note: data.note ?? null,
        privacyConsent: true,
        explicitConsent: true,
        status: 'PENDING',
        // The first status entry and the mail outbox rows share the transaction.
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Request created (web form).',
          },
        },
        outboxEntries: {
          create: [
            {
              type: 'BOOKING_CUSTOMER',
              recipient: data.email.toLowerCase(),
            },
            { type: 'BOOKING_ADMIN' },
          ],
        },
      },
    });
  } catch (err) {
    return apiServerError(err, 'api/booking:dbKayit');
  }

  // --- 6. Response ---
  return NextResponse.json(
    {
      ok: true,
      id: booking.id,
      message: 'We have received your request. Our team will contact you shortly.',
    },
    { status: 201 }
  );
}

/**
 * GET /api/booking
 *
 * This endpoint deliberately exposes NO public listing or lookup. Admin
 * operations (list, detail, status update) live in an authenticated route
 * group under /api/admin/booking/*.
 *
 * Answering 405 here is intentional: it prevents accidentally opening a public
 * listing.
 */
export async function GET() {
  return apiError('Method not supported.', 405, 'METHOD_NOT_ALLOWED');
}
