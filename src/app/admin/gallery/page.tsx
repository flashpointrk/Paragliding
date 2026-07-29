/**
 * Gallery management (/admin/gallery).
 */

import { prisma } from '@/lib/prisma';
import { GalleryListClient } from './GalleryListClient';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const gallery = await prisma.galleryMedia.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Gallery</h1>
        <p className="text-sm text-navy-500">
          Manage the gallery media — upload files or enter a URL directly.
        </p>
      </div>
      <GalleryListClient gallery={gallery} />
    </div>
  );
}
