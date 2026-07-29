/**
 * /api/admin/gallery
 *
 * GET  – gallery media list (staff), ordered by sortOrder
 * POST – create a new gallery media record (staff)
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
import { galleryUrlSchema } from '@/lib/gallery/url';

export const dynamic = 'force-dynamic';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

const DEFAULT_CATEGORY = 'takeoff';

// Image dimensions are bounded, to guard against malicious or corrupt values.
const sizeSchema = z.number().int().positive().max(20000);

const createSchema = z.object({
  url: galleryUrlSchema,
  title: z.string().trim().max(200).optional().nullable(),
  altText: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  // Returned by the upload route, for the masonry layout — optional.
  width: sizeSchema.optional(),
  height: sizeSchema.optional(),
  // "image" (default) | "video" — decides how the gallery renders it.
  type: z.enum(['image', 'video']).optional(),
});

export async function GET() {
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const gallery = await prisma.galleryMedia.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ ok: true, gallery });
  } catch (err) {
    return apiServerError(err, 'api/admin/gallery:get');
  }
}

export async function POST(req: Request) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  try {
    const record = await prisma.galleryMedia.create({
      data: {
        url: result.data.url,
        title: result.data.title || null,
        altText: result.data.altText || null,
        // The category is no longer used in the interface; the legacy schema field is
        // filled with a fixed default so existing records stay compatible.
        category: DEFAULT_CATEGORY,
        sortOrder: result.data.sortOrder,
        active: result.data.active,
        width: result.data.width ?? null,
        height: result.data.height ?? null,
        type: result.data.type ?? 'image',
      },
    });
    return NextResponse.json({ ok: true, gallery: record }, { status: 201 });
  } catch (err) {
    return apiServerError(err, 'api/admin/gallery:post');
  }
}
