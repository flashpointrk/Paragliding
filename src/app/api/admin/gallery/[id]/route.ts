/**
 * /api/admin/gallery/[id]
 *
 * PATCH  – update (staff)
 * PUT    – update (staff) — same behaviour as PATCH
 * DELETE – delete (staff)
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
  mapPrismaError,
} from '@/lib/api-error';
import { galleryUrlSchema } from '@/lib/gallery/url';
import { deleteLocalGalleryFile } from '@/lib/gallery/storage';

export const dynamic = 'force-dynamic';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

// Image dimensions are bounded, to guard against malicious or corrupt values.
const sizeSchema = z.number().int().positive().max(20000);

const updateSchema = z.object({
  url: galleryUrlSchema.optional(),
  title: z.string().trim().max(200).optional().nullable(),
  altText: z.string().trim().max(300).optional().nullable(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
  // Returned by the upload route, for the masonry layout — optional.
  width: sizeSchema.optional(),
  height: sizeSchema.optional(),
  // "image" | "video" — decides how the gallery renders it.
  type: z.enum(['image', 'video']).optional(),
});

async function update(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  const { title, altText, ...rest } = result.data;

  try {
    // Read the current url before updating, so the old local file can be deleted
    // from disk if the url changed (see deleteLocalGalleryFile).
    const previous = await prisma.galleryMedia.findUnique({
      where: { id },
      select: { url: true },
    });
    if (!previous) {
      return apiError('Record not found.', 404, 'NOT_FOUND');
    }

    const gallery = await prisma.galleryMedia.update({
      where: { id: id },
      data: {
        ...rest,
        ...(title !== undefined ? { title: title || null } : {}),
        ...(altText !== undefined ? { altText: altText || null } : {}),
      },
    });

    // When the url changed and the old one was a local upload, clean the now
    // unused file from disk (a failure here must not fail the request).
    if (result.data.url !== undefined && result.data.url !== previous.url) {
      await deleteLocalGalleryFile(previous.url, 'api/admin/gallery/[id]:put');
    }

    return NextResponse.json({ ok: true, gallery });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Record not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/gallery/[id]:put');
  }
}

export const PATCH = update;
export const PUT = update;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const deleted = await prisma.galleryMedia.delete({ where: { id: id } });
    // For a local upload, delete the file too (failures do not fail the request).
    await deleteLocalGalleryFile(deleted.url, 'api/admin/gallery/[id]:delete');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Record not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/gallery/[id]:delete');
  }
}
