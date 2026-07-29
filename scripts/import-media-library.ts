/**
 * Moves legacy page media into the standalone Media Library.
 *
 * Page media used to be written alongside the gallery, under
 * `uploads/gallery`. It now lives in `uploads/media` with its own `PageMedia`
 * records. This script moves the files, rewrites the records and repoints the
 * image references stored in page content.
 *
 * Only `PageMedia` is touched — `GalleryMedia` and the gallery's own files are
 * left alone. Safe to re-run: files are copied with `COPYFILE_EXCL` and records
 * already pointing at the new prefix are not selected.
 */

import path from 'node:path';
import { copyFile, mkdir } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const appRoot = process.cwd();
const legacyDir = path.join(appRoot, 'public', 'uploads', 'gallery');
const targetDir = path.join(appRoot, 'public', 'uploads', 'media');
const oldUrlPrefix = '/uploads/gallery/';
const newUrlPrefix = '/uploads/media/';

async function copyIfPresent(source: string, target: string): Promise<void> {
  try {
    await copyFile(source, target, fsConstants.COPYFILE_EXCL);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
  }
}

/** Moves the files and records, returning the old URL → new URL mapping. */
async function moveLegacyPageMedia(): Promise<Map<string, string>> {
  const legacyMedia = await prisma.pageMedia.findMany({
    where: { url: { startsWith: oldUrlPrefix } },
  });
  const mappings = new Map<string, string>();

  for (const media of legacyMedia) {
    const fileName = media.url.slice(oldUrlPrefix.length).split(/[?#]/, 1)[0] ?? '';
    if (!fileName || path.basename(fileName) !== fileName) {
      throw new Error(`Invalid legacy page media path: ${media.url}`);
    }

    const legacyPath = path.join(legacyDir, fileName);
    const targetPath = path.join(targetDir, fileName);
    const newUrl = `${newUrlPrefix}${fileName}`;

    await copyIfPresent(legacyPath, targetPath);
    await prisma.pageMedia.update({ where: { id: media.id }, data: { url: newUrl } });
    mappings.set(media.url, newUrl);
  }

  return mappings;
}

/** Repoints the image URLs stored on page-content records. */
async function updateContentReferences(mappings: Map<string, string>): Promise<number> {
  if (mappings.size === 0) return 0;
  const contents = await prisma.pageContent.findMany({ select: { id: true, images: true } });
  let updated = 0;

  for (const content of contents) {
    if (!content.images || Array.isArray(content.images) || typeof content.images !== 'object') {
      continue;
    }
    const previous = content.images as Record<string, unknown>;
    const next = Object.fromEntries(
      Object.entries(previous).map(([key, value]) => [
        key,
        typeof value === 'string' ? (mappings.get(value) ?? value) : value,
      ])
    );
    if (JSON.stringify(previous) === JSON.stringify(next)) continue;
    await prisma.pageContent.update({
      where: { id: content.id },
      data: { images: next as Prisma.InputJsonValue },
    });
    updated += 1;
  }

  return updated;
}

async function main() {
  await mkdir(targetDir, { recursive: true });
  const mappings = await moveLegacyPageMedia();
  const updatedContent = await updateContentReferences(mappings);
  console.log(`${mappings.size} legacy page media record(s) moved.`);
  console.log(`${updatedContent} image reference(s) updated in page content.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
