/**
 * FAQ management (/admin/faq).
 */

import { prisma } from '@/lib/prisma';
import { FaqListClient } from './FaqListClient';

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  const faq = await prisma.faq.findMany({
    orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">FAQ</h1>
        <p className="text-sm text-navy-500">
          Manage the FAQ content.
        </p>
      </div>
      <FaqListClient faq={faq} />
    </div>
  );
}
