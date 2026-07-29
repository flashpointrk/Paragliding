/**
 * POST /api/admin/booking/[id]/status
 *
 * Updates a booking's status. Staff only.
 *
 * Body:
 *  - status: BookingStatus (PENDING | CONFIRMED | POSTPONED | CANCELLED | COMPLETED)
 *  - note?:  free-form explanation
 *
 * Both steps share one transaction:
 *  1. Update Booking.status
 *  2. Write a new BookingStatusHistory row (userId = the session user id)
 *
 * By rule, a history entry is written on EVERY status change.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff } from '@/lib/admin-auth';
import {
  apiError,
  apiServerError,
  apiValidationError,
  checkBodySize,
} from '@/lib/api-error';
import { isBookingStatusTransitionAllowed } from '@/lib/booking/status';

export const dynamic = 'force-dynamic';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'POSTPONED', 'CANCELLED', 'COMPLETED']),
  note: z.string().trim().max(1000).optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  if (!id) {
    return apiError('Invalid ID.', 400, 'INVALID_ID');
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  const result = schema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  const { status, note } = result.data;

  try {
    // Transaction: re-read the current status, validate the transition, then
    // update the status and write the history entry.
    const current = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({
        where: { id },
        select: { id: true, status: true },
      });
      if (!existing) return { type: 'not_found' as const };
      if (!isBookingStatusTransitionAllowed(existing.status, status)) {
        return {
          type: 'gecis-gecersiz' as const,
          existing: existing.status,
        };
      }

      const r = await tx.booking.update({
        where: { id },
        data: { status },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          status,
          note: note ?? null,
          userId: auth.user.id,
        },
      });
      return { type: 'updated' as const, booking: r };
    });

    if (current.type === 'not_found') {
      return apiError('Booking not found.', 404, 'NOT_FOUND');
    }
    if (current.type === 'gecis-gecersiz') {
      return apiError(
        `Status cannot move from ${current.existing} to ${status}.`,
        409,
        'INVALID_STATUS_TRANSITION'
      );
    }

    return NextResponse.json({ ok: true, booking: current.booking });
  } catch (err) {
    return apiServerError(err, 'api/admin/booking/[id]/status:post');
  }
}
