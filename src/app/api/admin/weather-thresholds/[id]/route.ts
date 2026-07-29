/**
 * /api/admin/weather-thresholds/[id]  (ADMIN ONLY)
 *
 * GET    – a single threshold (reading could be opened to all staff, but the
 *          admin page is admin-only anyway, so this stays admin for consistency)
 * PUT    – update (ADMIN)
 * DELETE – delete (ADMIN)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiRequireAdmin } from '@/lib/admin-auth';
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
  locationName: z.string().trim().min(2).max(120).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  takeoffHeading: z.number().min(0).max(360).optional(),
  windMaxGreen: z.number().min(0).optional(),
  windMaxAmber: z.number().min(0).optional(),
  gustDeltaMaxGreen: z.number().min(0).optional(),
  gustDeltaMaxAmber: z.number().min(0).optional(),
  precipMaxGreen: z.number().min(0).optional(),
  precipMaxAmber: z.number().min(0).optional(),
  visibilityMinGreen: z.number().min(0).optional(),
  visibilityMinAmber: z.number().min(0).optional(),
  windSectorMin: z.number().min(0).max(360).nullable().optional(),
  windSectorMax: z.number().min(0).max(360).nullable().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireAdmin();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const threshold = await prisma.weatherThreshold.findUnique({ where: { id: id } });
    if (!threshold) {
      return apiError('Threshold not found.', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ ok: true, threshold });
  } catch (err) {
    return apiServerError(err, 'api/admin/weather-thresholds/[id]:get');
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireAdmin(req);
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
    const threshold = await prisma.weatherThreshold.update({
      where: { id: id },
      data: result.data,
    });
    return NextResponse.json({ ok: true, threshold });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Threshold not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/weather-thresholds/[id]:put');
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await apiRequireAdmin(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    await prisma.weatherThreshold.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Threshold not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/weather-thresholds/[id]:delete');
  }
}
