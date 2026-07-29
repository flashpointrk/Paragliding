/**
 * Page content management (/admin/page-content).
 */

import { prisma } from '@/lib/prisma';
import { PAGE_CONTENT_DEFINITIONS } from '@/lib/admin/page-content';
import { PageContentClient } from './PageContentClient';

export const dynamic = 'force-dynamic';

export default async function PageContentPage() {
  const records = await prisma.pageContent.findMany({
    orderBy: [{ slug: 'asc' }, { locale: 'asc' }],
    select: {
      id: true,
      slug: true,
      locale: true,
      active: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Page content</h1>
        <p className="text-sm text-navy-500">
          Manage the text overrides and per-page images across every page.
        </p>
      </div>
      <PageContentClient definitions={PAGE_CONTENT_DEFINITIONS} records={records} />
    </div>
  );
}
