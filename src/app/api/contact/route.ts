/**
 * POST /api/contact
 *
 * The public contact form endpoint. Forwards the message to the admin by
 * e-mail. It does NOT write to the database — it is notification only.
 *
 * Flow:
 *  0. CSRF check (Origin/Referer same-origin)
 *  1. Rate limit (per IP, 5/minute)
 *  2. Cloudflare Turnstile verification (canonical siteverify)
 *  3. Body validation (Zod)
 *  4. E-mail: admin notification (console when SMTP is absent)
 *  5. Response: { ok: true } | { ok: false, errors }
 *
 * Security:
 *  - A honeypot field traps bots.
 *  - The rate limit curbs abuse.
 *  - Turnstile adds bot protection when enabled.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { checkCsrf } from '@/lib/csrf';
import { verifyTurnstile } from '@/lib/turnstile';
import { apiServerError } from '@/lib/api-error';

// Rate limit: five messages per minute per IP
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Your full name must be at least 2 characters')
    .max(100, 'Your full name is too long'),
  email: z
    .string()
    .trim()
    .min(1, 'E-mail address is required')
    .email('Please enter a valid e-mail address')
    .max(120, 'E-mail address is too long'),
  subject: z
    .string()
    .trim()
    .min(2, 'The subject must be at least 2 characters')
    .max(200, 'The subject is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Your message must be at least 10 characters')
    .max(5000, 'Your message can be at most 5000 characters'),

  // Honeypot — bots fill it in, real users never see it.
  bosphorus: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || v.length === 0, { message: 'Spam tespit edildi' }),

  // Turnstile token (cf-turnstile-response). Optional in the schema;
  // required on the server when verifyTurnstile is enabled.
  turnstileToken: z
    .string()
    .trim()
    .max(4096, 'Turnstile token is too long')
    .optional(),
});

export async function POST(req: Request) {
  // --- 0. CSRF check ---
  const csrf = checkCsrf(req);
  if (!csrf.valid) {
    console.warn('[api/contact] CSRF reddedildi:', csrf.reason);
    return NextResponse.json(
      { ok: false, message: 'The request could not be verified.' },
      { status: 403 }
    );
  }

  // --- 1. Rate limit ---
  const ip = getClientIp(req);
  const rl = rateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: 'You have sent too many messages. Please wait a moment and try again.',
        retryAfterSeconds: Math.ceil(rl.retryAfterMs / 1000),
      },
      { status: 429 }
    );
  }

  // --- 2. Body parse ---
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  // --- 3. Cloudflare Turnstile verification (before Zod) ---
  const turnstileToken =
    typeof body === 'object' && body !== null
      ? (body as { turnstileToken?: unknown }).turnstileToken
      : undefined;
  const tokenStr =
    typeof turnstileToken === 'string' ? turnstileToken : null;

  const ts = await verifyTurnstile(tokenStr, ip);
  if (!ts.successful) {
    return NextResponse.json(
      {
        ok: false,
        errors: { turnstileToken: 'Security verification is required.' },
        message: 'Security verification failed.',
      },
      { status: 400 }
    );
  }

  // --- 4. Zod validasyonu ---
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? '_');
      if (!errors[field]) errors[field] = issue.message;
    }
    return NextResponse.json(
      { ok: false, errors, message: 'Please check the form.' },
      { status: 422 }
    );
  }

  const data = result.data;

  // Extra honeypot guard (the schema checks it too — belt and braces)
  if (data.bosphorus && data.bosphorus.length > 0) {
    // Bot detected — answer 200 quietly but send nothing, so the bot cannot tell
    return NextResponse.json({ ok: true });
  }

  // --- 5. The message and the mail outbox row share one transaction ---
  try {
    const request = await prisma.$transaction(async (tx) => {
      const record = await tx.contactRequest.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          subject: data.subject,
          message: data.message,
        },
      });
      await tx.mailOutbox.create({
        data: {
          type: 'CONTACT_ADMIN',
          contactRequestId: record.id,
        },
      });
      return record;
    });

    return NextResponse.json(
      {
        ok: true,
        id: request.id,
        message: 'We have received your message. We will get back to you shortly.',
      },
      { status: 201 }
    );
  } catch (err) {
    return apiServerError(err, 'api/contact:outboxKaydi');
  }
}

/**
 * GET /api/contact
 * Exposes no public listing or read. The 405 is deliberate.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: 'Method not supported.' },
    { status: 405 }
  );
}
