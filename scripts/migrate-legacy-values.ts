/**
 * One-off data migration for the Turkish → English rename.
 *
 * Tables, columns and enum types are renamed by
 * `prisma/rename-legacy-identifiers.sql`. This script covers the other half:
 * stored *values* that were Turkish identifiers the application matches on.
 * Run it after that SQL file, or on its own if the database was already
 * created from the English baseline.
 *
 *   - page_content.slug        — keys of the managed-content dictionary
 *   - page_content.images      — image slot keys inside the JSON column
 *   - gallery_media.category   — takeoff / inflight / landing / guest
 *   - gallery_media.type       — image (video was already English)
 *   - bookings.media_preference — none / photo / photo-video
 *   - bookings.weight_range    — the "specify" sentinel
 *
 * Safe to run more than once: every statement only matches the old value, so a
 * second run updates nothing. Run it once per environment, right after
 * deploying the renamed build:
 *
 *   npm run db:migrate-legacy-values
 */
import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const PAGE_SLUGS: Record<string, string> = {
  home: 'home',
  gallery: 'gallery',
  contact: 'contact',
  pilots: 'pilots',
  liveStatus: 'liveStatus',
  about: 'about',
  packages: 'packages',
  safety: 'safety',
  flightSite: 'flightSite',
  booking: 'booking',
  privacyPolicy: 'privacyPolicy',
  cookiePolicy: 'cookiePolicy',
  termsOfSale: 'termsOfSale',
  common: 'common',
  sss: 'faq',
};

const GALLERY_CATEGORIES: Record<string, string> = {
  takeoff: 'takeoff',
  inflight: 'inflight',
  landing: 'landing',
  guest: 'guest',
};

/** Page-content image slot keys, renamed alongside the code. */
const IMAGE_SLOTS: Record<string, string> = {
  ogImage: 'ogImage',
  whyUs1: 'whyUs1',
  whyUs2: 'whyUs2',
  whyUs3: 'whyUs3',
  whyUs4: 'whyUs4',
  process: 'process',
  portrait: 'portrait',
  kare1: 'tile1',
  kare2: 'tile2',
  kare3: 'tile3',
  kare4: 'tile4',
};

const MEDIA_PREFERENCES: Record<string, string> = {
  yok: 'none',
  photo: 'photo',
  'foto-video': 'photo-video',
};

async function main() {
  let changed = 0;

  for (const [from, to] of Object.entries(PAGE_SLUGS)) {
    const { count } = await prisma.pageContent.updateMany({
      where: { slug: from },
      data: { slug: to },
    });
    if (count) console.log(`page_content.slug  ${from} → ${to}  (${count})`);
    changed += count;
  }

  for (const [from, to] of Object.entries(GALLERY_CATEGORIES)) {
    const { count } = await prisma.galleryMedia.updateMany({
      where: { category: from },
      data: { category: to },
    });
    if (count) console.log(`gallery.category   ${from} → ${to}  (${count})`);
    changed += count;
  }

  const media = await prisma.galleryMedia.updateMany({
    where: { type: 'gorsel' },
    data: { type: 'image' },
  });
  if (media.count) console.log(`gallery.type       gorsel → image  (${media.count})`);
  changed += media.count;

  for (const [from, to] of Object.entries(MEDIA_PREFERENCES)) {
    if (from === to) continue;
    const { count } = await prisma.booking.updateMany({
      where: { mediaPreference: from },
      data: { mediaPreference: to },
    });
    if (count) console.log(`booking.media      ${from} → ${to}  (${count})`);
    changed += count;
  }

  const weight = await prisma.booking.updateMany({
    where: { weightRange: 'belirt' },
    data: { weightRange: 'specify' },
  });
  if (weight.count) console.log(`booking.weight     belirt → specify  (${weight.count})`);
  changed += weight.count;

  // Page-content image slots are addressed by key, and those keys are stored
  // inside the `images` JSON column, so renaming them in code is not enough.
  const contents = await prisma.pageContent.findMany({ select: { id: true, images: true } });
  for (const content of contents) {
    if (!content.images || Array.isArray(content.images) || typeof content.images !== 'object') {
      continue;
    }
    const previous = content.images as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(previous)) {
      next[IMAGE_SLOTS[key] ?? key] = value;
    }
    if (JSON.stringify(previous) === JSON.stringify(next)) continue;
    await prisma.pageContent.update({
      where: { id: content.id },
      data: { images: next as Prisma.InputJsonValue },
    });
    console.log(`page_content.images  slot keys renamed  (${content.id})`);
    changed += 1;
  }

  // The media library's upload directory was renamed, so the stored URLs move
  // with it. Rename the directory on the uploads volume as well, or the files
  // will 404:  mv public/uploads/medya public/uploads/media
  const mediaUrls = await prisma.pageMedia.findMany({
    where: { url: { startsWith: '/uploads/medya/' } },
    select: { id: true, url: true },
  });
  for (const item of mediaUrls) {
    await prisma.pageMedia.update({
      where: { id: item.id },
      data: { url: item.url.replace('/uploads/medya/', '/uploads/media/') },
    });
  }
  if (mediaUrls.length) {
    console.log(`page_media.url     /uploads/medya/ → /uploads/media/  (${mediaUrls.length})`);
  }
  changed += mediaUrls.length;

  console.log(changed ? `\n${changed} row(s) updated.` : '\nNothing to migrate — already up to date.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
