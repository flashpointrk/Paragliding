/**
 * /api/admin/settings
 *
 * GET – returns the ContactSettings "global" row, or empty defaults when it
 *       does not exist.
 * PUT – updates the "global" row (upserting when absent). Staff only.
 *
 * Note: ContactSettings.id is the fixed string "global" (not a cuid, but the
 * schema accepts any string @id). One-row policy.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff } from '@/lib/admin-auth';
import {
  apiError,
  apiServerError,
  apiValidationError,
  checkBodySize,
} from '@/lib/api-error';

export const dynamic = 'force-dynamic';

const GLOBAL_ID = 'global';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

const upsertSchema = z
  .object({
    phone: z.string().trim().max(40).nullable().optional(),
    whatsapp: z.string().trim().max(40).nullable().optional(),
    email: z.string().trim().email().max(120).nullable().optional(),
    address: z.string().trim().max(500).nullable().optional(),
    openingHours: z.string().trim().max(200).nullable().optional(),
  openingHoursTr: z.string().trim().max(200).nullable().optional(),
    mapEmbed: z.string().trim().max(2000).nullable().optional(),
    facebook: z.string().trim().url().nullable().optional(),
    instagram: z.string().trim().url().nullable().optional(),
    youtube: z.string().trim().url().nullable().optional(),
    // --- Cloudflare Turnstile (bot protection) ---
    turnstileEnabled: z.boolean().optional(),
    turnstileSiteKey: z.string().trim().max(256).nullable().optional(),
    turnstileSecret: z.string().trim().max(256).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // When marked enabled, both siteKey and secret must be present.
    if (data.turnstileEnabled === true) {
      if (!data.turnstileSiteKey || data.turnstileSiteKey.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['turnstileSiteKey'],
          message: 'The site key is required while Turnstile is enabled.',
        });
      }
      if (!data.turnstileSecret || data.turnstileSecret.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['turnstileSecret'],
          message: 'The secret key is required while Turnstile is enabled.',
        });
      }
    }
  });

/**
 * Returns the ContactSettings row with turnstileSecret MASKED.
 *
 * The secret must never reach the client in an API response. Only whether one
 * exists is exposed (the turnstileSecretSet boolean), which is enough for the
 * admin form to render a filled or empty input correctly.
 */
function maskSettings(settings: {
  turnstileSecret?: string | null;
  [k: string]: unknown;
}) {
  const { turnstileSecret, ...rest } = settings as Record<string, unknown>;
  return {
    ...rest,
    // Drop the secret from the response; keep only the "is it set" flag.
    turnstileSecret: null,
    turnstileSecretSet: Boolean(
      turnstileSecret && String(turnstileSecret).length > 0
    ),
  };
}

export async function GET() {
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const settings = await prisma.contactSettings.findUnique({ where: { id: GLOBAL_ID } });
    // Mask the secret — never leak it to the client.
    const safe = settings ? maskSettings(settings) : null;
    return NextResponse.json({ ok: true, settings: safe });
  } catch (err) {
    return apiServerError(err, 'api/admin/settings:get');
  }
}

export async function PUT(req: Request) {
  // CSRF check (Origin/Referer) — this is a write.
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  const result = upsertSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  /**
   * How the secret is updated:
   *  - The form only sends the secret when "Edit" was clicked and a new value
   *    was typed. Otherwise it arrives as null or empty.
   *  - When turnstileSecret is absent or null in the request body, KEEP the
   *    existing secret (do not overwrite it with null), so saving the other
   *    fields never wipes it by accident.
   *  - An explicit empty string clears the secret (sets it to null).
   */
  const payload = { ...result.data };
  if (payload.turnstileSecret === null || payload.turnstileSecret === undefined) {
    // Read the current row and preserve the secret.
    const existing = await prisma.contactSettings.findUnique({
      where: { id: GLOBAL_ID },
      select: { turnstileSecret: true },
    });
    payload.turnstileSecret = existing?.turnstileSecret ?? null;
  }

  try {
    const settings = await prisma.contactSettings.upsert({
      where: { id: GLOBAL_ID },
      create: { id: GLOBAL_ID, ...payload },
      update: payload,
    });

    // Mask the secret in the response.
    return NextResponse.json({ ok: true, settings: maskSettings(settings) });
  } catch (err) {
    return apiServerError(err, 'api/admin/settings:put');
  }
}
