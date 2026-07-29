/**
 * Weather threshold management (/admin/weather-thresholds). ADMIN ONLY.
 *
 * A server component. requireAdmin() adds a second guard (the layout already
 * enforces requireStaff).
 */

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { ThresholdListClient } from './ThresholdListClient';

export const dynamic = 'force-dynamic';

export default async function WeatherThresholdsPage() {
  // Ek koruma: sadece ADMIN
  await requireAdmin();

  const thresholds = await prisma.weatherThreshold.findMany({
    orderBy: [{ locationName: 'asc' }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Weather thresholds</h1>
        <p className="text-sm text-navy-500">
          Manage the per-location flight suitability thresholds (ADMIN only).
        </p>
      </div>
      <ThresholdListClient thresholds={thresholds} />
    </div>
  );
}
