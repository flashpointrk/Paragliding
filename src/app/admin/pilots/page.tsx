/**
 * Pilot management (/admin/pilots).
 */

import { prisma } from '@/lib/prisma';
import { PilotListClient } from './PilotListClient';

export const dynamic = 'force-dynamic';

export default async function PilotsPage() {
  const pilots = await prisma.pilot.findMany({
    orderBy: [{ name: 'asc' }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Pilots</h1>
        <p className="text-sm text-navy-500">
          Manage the tandem pilots.
        </p>
      </div>
      <PilotListClient pilots={pilots} />
    </div>
  );
}
