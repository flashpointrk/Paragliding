/**
 * /api/gallery
 *
 * GET – the public gallery feed (no authentication). Returns only `active:
 * true` records, in exactly the same order as the public gallery page. The
 * client (GalleryFeed) pulls the next page with `cursor` as it scrolls.
 */

import { NextResponse } from 'next/server';
import { apiServerError } from '@/lib/api-error';
import {
  fetchGalleryPage,
  GALLERY_DEFAULT_LIMIT,
  GALLERY_MAX_LIMIT,
} from '@/lib/gallery/query';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('imlec');

  let limit = GALLERY_DEFAULT_LIMIT;
  const limitParam = searchParams.get('limit');
  if (limitParam) {
    const n = Number(limitParam);
    if (Number.isFinite(n) && n > 0) {
      limit = Math.min(Math.trunc(n), GALLERY_MAX_LIMIT);
    }
  }

  try {
    const { items, nextCursor } = await fetchGalleryPage({
      cursor,
      limit,
    });

    return NextResponse.json(
      { ok: true, items, nextCursor },
      { headers: { 'Cache-Control': 'public, max-age=60' } }
    );
  } catch (err) {
    return apiServerError(err, 'api/gallery:get');
  }
}
