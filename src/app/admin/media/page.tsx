import { prisma } from '@/lib/prisma';
import { MediaLibraryClient } from './MediaLibraryClient';

export const dynamic = 'force-dynamic';

export default async function MediaLibraryPage() {
  const mediaItems = await prisma.pageMedia.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Media library</h1>
        <p className="text-sm text-navy-500">
          Manage the images used in page content. Gallery media is not listed here.
        </p>
      </div>
      <MediaLibraryClient initialMedia={mediaItems} />
    </div>
  );
}
