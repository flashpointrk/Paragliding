/**
 * /api/admin/packages/[id]
 *
 * GET    – a single package (staff)
 * PUT    – update (staff)
 * DELETE – delete (staff). Prisma cascade: because Booking.packageId is
 *          required, the delete succeeds only when no bookings reference the
 *          package, and raises a foreign-key violation otherwise. In practice
 *          deactivating the package is preferred, but DELETE stays supported.
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
  mapPrismaError,
} from '@/lib/api-error';

export const dynamic = 'force-dynamic';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  nameTr: z.string().trim().max(120).nullish(),
  description: z.string().trim().min(1).max(2000).optional(),
  descriptionTr: z.string().trim().max(2000).nullish(),
  content: z.array(z.string().trim().min(1)).max(50).optional(),
  contentTr: z.array(z.string().trim().min(1)).max(50).optional(),
  showPrice: z.boolean().optional(),
  priceMin: z.number().int().nonnegative().nullable().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const pkg = await prisma.package.findUnique({ where: { id: id } });
    if (!pkg) {
      return apiError('Package not found.', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ ok: true, pkg });
  } catch (err) {
    return apiServerError(err, 'api/admin/packages/[id]:get');
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  try {
    const pkg = await prisma.package.update({
      where: { id: id },
      data: result.data,
    });
    return NextResponse.json({ ok: true, pkg });
  } catch (err) {
    // P2025 (record not found) gets a specific message; everything else generic.
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Package not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/packages/[id]:put');
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    // Check for bookings; refuse to delete and warn when any exist
    const bookingCount = await prisma.booking.count({
      where: { packageId: id },
    });
    if (bookingCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `This package has ${bookingCount} booking(s). Deactivate it instead of deleting.`,
          code: 'RELATION_CONSTRAINT',
        },
        { status: 409 }
      );
    }

    await prisma.package.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Package not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/packages/[id]:delete');
  }
}
