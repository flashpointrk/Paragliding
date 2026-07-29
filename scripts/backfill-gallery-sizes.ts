/**
 * Backfills the `width`/`height` columns of existing GalleryMedia rows, which
 * the uncropped masonry layout needs.
 *
 * It only handles local (site-relative, "/"-prefixed) URLs: the `public/<url>`
 * file is read with sharp and its true pixel size is written back. External
 * (http/https) URLs would need a network request and are skipped with a log
 * line.
 *
 * Run with: npm run db:backfill-gallery-sizes
 */

import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const prisma = new PrismaClient();

async function main() {
  const records = await prisma.galleryMedia.findMany({
    where: { OR: [{ width: null }, { height: null }] },
    select: { id: true, url: true },
  });

  console.log(`${records.length} record(s) missing dimensions.`);

  let filled = 0;
  let skipped = 0;

  for (const record of records) {
    // A "//" prefix (a protocol-relative external address) or http(s) is not a
    // local file and would need a network request. Skip it.
    if (!record.url.startsWith('/') || record.url.startsWith('//')) {
      console.log(`Skipped (external URL): ${record.id} -> ${record.url}`);
      skipped++;
      continue;
    }

    const filePath = path.join(process.cwd(), 'public', record.url);
    try {
      const buffer = await fs.readFile(filePath);
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) {
        console.log(`Skipped (could not read dimensions): ${record.id} -> ${record.url}`);
        skipped++;
        continue;
      }
      await prisma.galleryMedia.update({
        where: { id: record.id },
        data: { width: meta.width, height: meta.height },
      });
      console.log(`Dolduruldu: ${record.id} -> ${meta.width}x${meta.height}`);
      filled++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`Skipped (could not read file): ${record.id} -> ${filePath} (${message})`);
      skipped++;
    }
  }

  console.log(`Done. Filled: ${filled}, skipped: ${skipped}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
