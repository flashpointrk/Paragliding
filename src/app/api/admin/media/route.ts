/**
 * /api/admin/media
 *
 * The page media library, independent of the gallery. Images live under
 * `public/uploads/media` and are managed through `PageMedia` records.
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff } from '@/lib/admin-auth';
import { apiError, apiServerError, safeLog } from '@/lib/api-error';
import { MEDIA_UPLOAD_DIR, MEDIA_UPLOAD_URL_PREFIX } from '@/lib/media/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_COUNT = 6;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const ACCEPTED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);

export async function GET(req: Request) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) return apiError(auth.message, auth.status);

  try {
    const mediaItems = await prisma.pageMedia.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ ok: true, mediaItems });
  } catch (err) {
    return apiServerError(err, 'api/admin/media:get');
  }
}

export async function POST(req: Request) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) return apiError(auth.message, auth.status);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return apiError('Invalid form data.', 400);
  }

  const files = form
    .getAll('dosyalar')
    .filter((value): value is File => value instanceof File);

  if (files.length === 0) return apiError('No image to upload.', 400);
  if (files.length > MAX_FILE_COUNT) {
    return apiError(`You can upload at most ${MAX_FILE_COUNT} images at once.`, 400);
  }

  try {
    await mkdir(MEDIA_UPLOAD_DIR, { recursive: true });
    const lastRecord = await prisma.pageMedia.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    let sortOrder = (lastRecord?.sortOrder ?? 0) + 1;
    const mediaItems = [];

    for (const file of files) {
      const name = file.name || 'Image';
      if (file.size <= 0) return apiError(`"${name}" is empty.`, 400);
      if (file.size > MAX_IMAGE_BYTES) return apiError(`"${name}" exceeds the 25 MB limit.`, 400);
      if (!ACCEPTED_MIME.has(file.type)) {
        return apiError(`"${name}" is an unsupported image type.`, 400);
      }

      const input = Buffer.from(await file.arrayBuffer());
      const pipeline = sharp(input, { failOn: 'error' }).rotate();
      const metadata = await pipeline.metadata();
      if (!metadata.format || !ACCEPTED_FORMATS.has(metadata.format)) {
        return apiError(`"${name}" is not a valid image.`, 400);
      }

      const fileName = `${randomUUID()}.webp`;
      const output = await pipeline
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      await writeFile(path.join(MEDIA_UPLOAD_DIR, fileName), output.data);

      const record = await prisma.pageMedia.create({
        data: {
          url: `${MEDIA_UPLOAD_URL_PREFIX}${fileName}`,
          title: name,
          width: output.info.width,
          height: output.info.height,
          sortOrder,
          active: true,
        },
      });
      mediaItems.push(record);
      sortOrder += 1;
    }

    return NextResponse.json({ ok: true, mediaItems }, { status: 201 });
  } catch (err) {
    safeLog('api/admin/media:post', err, undefined, 'warn');
    return apiServerError(err, 'api/admin/media:post');
  }
}
