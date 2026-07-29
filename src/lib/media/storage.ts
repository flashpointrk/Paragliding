/** Local file storage helpers for the page media library. */

import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { safeLog } from '@/lib/api-error';

export const MEDIA_UPLOAD_DIR = path.join(
  process.cwd(),
  'public',
  'uploads',
  'media'
);

export const MEDIA_UPLOAD_URL_PREFIX = '/uploads/media/';

export function mediaLocalFilePath(url: string): string | null {
  if (!url.startsWith(MEDIA_UPLOAD_URL_PREFIX)) return null;

  const fileName = url.slice(MEDIA_UPLOAD_URL_PREFIX.length).split(/[?#]/, 1)[0] ?? '';
  const parsed = path.resolve(MEDIA_UPLOAD_DIR, fileName);
  const allowedRoot = MEDIA_UPLOAD_DIR + path.sep;

  if (parsed !== MEDIA_UPLOAD_DIR && !parsed.startsWith(allowedRoot)) {
    return null;
  }
  return parsed;
}

export async function deleteMediaLocalFile(url: string, context: string): Promise<void> {
  const filePath = mediaLocalFilePath(url);
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch (err) {
    safeLog(context, err, { url }, 'warn');
  }
}
