import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff } from '@/lib/admin-auth';
import {
  apiValidationError,
  apiError,
  apiServerError,
  checkBodySize,
  mapPrismaError,
} from '@/lib/api-error';
import { deleteMediaLocalFile } from '@/lib/media/storage';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 50 * 1024;
const updateSchema = z.object({
  title: z.string().trim().max(200).optional().nullable(),
  altText: z.string().trim().max(300).optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) return apiError(auth.message, auth.status);

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const result = updateSchema.safeParse(bodyCheck.data);
  if (!result.success) return apiValidationError(result.error.issues);

  try {
    const { id } = await params;
    const media = await prisma.pageMedia.update({
      where: { id },
      data: {
        ...(result.data.title !== undefined ? { title: result.data.title || null } : {}),
        ...(result.data.altText !== undefined ? { altText: result.data.altText || null } : {}),
        ...(result.data.active !== undefined ? { active: result.data.active } : {}),
      },
    });
    return NextResponse.json({ ok: true, media });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched?.code === 'NOT_FOUND') return apiError('Media not found.', 404, 'NOT_FOUND');
    return apiServerError(err, 'api/admin/media/[id]:patch');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) return apiError(auth.message, auth.status);

  try {
    const { id } = await params;
    const media = await prisma.pageMedia.findUnique({ where: { id } });
    if (!media) return apiError('Media not found.', 404, 'NOT_FOUND');

    const contents = await prisma.pageContent.findMany({ select: { images: true } });
    const inUse = contents.some((content) => JSON.stringify(content.images).includes(media.url));
    if (inUse) {
      return apiError('This image is used by a page; replace it there first.', 409, 'IN_USE');
    }

    await prisma.pageMedia.delete({ where: { id } });
    await deleteMediaLocalFile(media.url, 'api/admin/media/[id]:delete');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiServerError(err, 'api/admin/media/[id]:delete');
  }
}
