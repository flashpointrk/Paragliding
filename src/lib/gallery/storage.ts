/**
 * Local file storage helpers for the gallery.
 *
 * Uploaded images live under `public/uploads/gallery`. This module decides
 * whether a `GalleryMedia.url` refers to a local upload and deletes it from
 * disk safely.
 *
 * Security: `galleryLocalFilePath` verifies that the resolved path stays inside
 * `GALLERY_UPLOAD_DIR`. Even if a `url` column somehow held a value containing
 * `../../` (through a malicious or corrupted row), it cannot escape the
 * directory and delete arbitrary files.
 */

import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { safeLog } from '@/lib/api-error';

/** Absolute directory holding the local gallery uploads. */
export const GALLERY_UPLOAD_DIR = path.join(
  process.cwd(),
  'public',
  'uploads',
  'gallery'
);

const UPLOAD_URL_PREFIX = '/uploads/gallery/';

/**
 * Returns the on-disk path for a `url` that points at a local gallery upload
 * (`/uploads/gallery/...`), and `null` for anything else (an external URL, a
 * static `/images/...` path and so on).
 */
export function galleryLocalFilePath(url: string): string | null {
  if (!url.startsWith(UPLOAD_URL_PREFIX)) return null;

  // A media URL may carry a cache-busting version (`?v=...`). That is for the
  // browser and the CDN; the disk path is built from the file name alone.
  const fileName = url.slice(UPLOAD_URL_PREFIX.length).split(/[?#]/, 1)[0] ?? '';
  const parsed = path.resolve(GALLERY_UPLOAD_DIR, fileName);
  const allowedRoot = GALLERY_UPLOAD_DIR + path.sep;

  // An attempt to escape the directory (e.g. "../../.env") — reject quietly.
  if (parsed !== GALLERY_UPLOAD_DIR && !parsed.startsWith(allowedRoot)) {
    return null;
  }
  return parsed;
}

/**
 * Deletes a gallery record's local file from disk, when it has one.
 * A missing file or a failed delete is logged and then ignored — the caller
 * must never fail a request because of it.
 */
export async function deleteLocalGalleryFile(
  url: string,
  context: string
): Promise<void> {
  const filePath = galleryLocalFilePath(url);
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch (err) {
    safeLog(context, err, { url }, 'warn');
  }
}
