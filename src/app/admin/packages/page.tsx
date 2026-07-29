/**
 * Package management (/admin/packages).
 *
 * A server component. Loads the package list and hands it to the client
 * manager (PackageListClient).
 */

import { prisma } from '@/lib/prisma';
import { PackageListClient } from './PackageListClient';

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Packages</h1>
        <p className="text-sm text-navy-500">
          Manage the tandem flight packages.
        </p>
      </div>
      <PackageListClient packages={packages} />
    </div>
  );
}
