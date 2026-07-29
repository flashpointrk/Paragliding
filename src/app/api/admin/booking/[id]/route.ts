/**
 * GET /api/admin/booking/[id]
 *
 * Returns the full detail of a single booking (package, status history and the
 * user behind each entry). Staff only.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff } from '@/lib/admin-auth';
import { apiError, apiServerError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  if (!id) {
    return apiError('Invalid ID.', 400, 'INVALID_ID');
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        package: true,
        statusHistory: {
          orderBy: { occurredAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return apiError('Booking not found.', 404, 'NOT_FOUND');
    }

    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    return apiServerError(err, 'api/admin/booking/[id]:get');
  }
}
