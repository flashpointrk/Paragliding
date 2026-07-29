/**
 * Public gallery query — cursor-based pagination.
 *
 * Both `src/app/[locale]/gallery/page.tsx` (the first page, rendered on the
 * server) and `src/app/api/gallery/route.ts` (the later pages the client pulls
 * while scrolling) use this single function, so the ordering can never drift
 * between the two — no duplicated or missing items across pages.
 */

import { prisma } from '@/lib/prisma';
import type { GalleryItem } from './types';

export const GALLERY_DEFAULT_LIMIT = 24;
export const GALLERY_MAX_LIMIT = 48;

export interface GalleryPage {
  items: GalleryItem[];
  /** Cursor for the next page; `null` when no records remain. */
  nextCursor: string | null;
}

export async function fetchGalleryPage(opts: {
  /** Id of the last record seen — omit it to get the first page. */
  cursor?: string | null;
  limit?: number;
}): Promise<GalleryPage> {
  const limit = Math.min(
    Math.max(1, opts.limit ?? GALLERY_DEFAULT_LIMIT),
    GALLERY_MAX_LIMIT
  );

  const items = await prisma.galleryMedia.findMany({
    where: { active: true },
    // The ordering used on the public page (and, because this function is its
    // only source, always identical). `id` comes last so the cursor is unique;
    // without it, equal `sortOrder` values could duplicate or drop items
    // between pages.
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    take: limit,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
    select: {
      id: true,
      url: true,
      title: true,
      altText: true,
      titleTr: true,
      altTextTr: true,
      category: true,
      width: true,
      height: true,
      type: true,
    },
  });

  // Fewer rows than the requested limit means there are no more records.
  const nextCursor =
    items.length === limit ? (items[items.length - 1]?.id ?? null) : null;

  return { items, nextCursor };
}
