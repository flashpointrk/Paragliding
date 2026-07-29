/**
 * /api/admin/gallery/bulk-delete
 *
 * POST – delete the selected gallery media in bulk (staff).
 *
 * Local uploads (`public/uploads/gallery`) are removed from disk too; external
 * URLs and static `/images/...` paths are left alone. The records are read
 * first (their urls are needed) and then removed in one `deleteMany`; a failed
 * disk delete never fails the request.
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
import { deleteLocalGalleryFile } from '@/lib/gallery/storage';

export const dynamic = 'force-dynamic';

// Maximum body size for a bulk delete (200 ids × a short cuid, plus JSON).
const MAX_BODY_BYTES = 50 * 1024;

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
});

export async function POST(req: Request) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }

  const result = bulkDeleteSchema.safeParse(bodyCheck.data);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  try {
    // Read the records BEFORE deleting — the file paths are needed.
    const records = await prisma.galleryMedia.findMany({
      where: { id: { in: result.data.ids } },
      select: { id: true, url: true },
    });

    if (records.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0 });
    }

    const { count } = await prisma.galleryMedia.deleteMany({
      where: { id: { in: records.map((k) => k.id) } },
    });

    // Delete local files from disk — log and continue on failure.
    for (const record of records) {
      await deleteLocalGalleryFile(record.url, 'api/admin/gallery/toplu-sil:unlink');
    }

    return NextResponse.json({ ok: true, deleted: count });
  } catch (err) {
    return apiServerError(err, 'api/admin/gallery/toplu-sil:post');
  }
}
