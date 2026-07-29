/**
 * /api/admin/weather-thresholds
 *
 * GET  – threshold list (any staff member may view)
 * POST – create a threshold (ADMIN ONLY)
 *
 * Weather thresholds are operationally critical, so writes (POST/PUT/DELETE)
 * are restricted to ADMIN. Viewing is open to all staff.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff, apiRequireAdmin } from '@/lib/admin-auth';
import {
  apiError,
  apiServerError,
  apiValidationError,
  checkBodySize,
} from '@/lib/api-error';

export const dynamic = 'force-dynamic';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

const thresholdSchema = z.object({
  locationName: z.string().trim().min(2).max(120),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  takeoffHeading: z.number().min(0).max(360),
  windMaxGreen: z.number().min(0),
  windMaxAmber: z.number().min(0),
  gustDeltaMaxGreen: z.number().min(0),
  gustDeltaMaxAmber: z.number().min(0),
  precipMaxGreen: z.number().min(0),
  precipMaxAmber: z.number().min(0),
  visibilityMinGreen: z.number().min(0),
  visibilityMinAmber: z.number().min(0),
  windSectorMin: z.number().min(0).max(360).nullable().optional(),
  windSectorMax: z.number().min(0).max(360).nullable().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const thresholds = await prisma.weatherThreshold.findMany({
      orderBy: [{ locationName: 'asc' }],
    });
    return NextResponse.json({ ok: true, thresholds });
  } catch (err) {
    return apiServerError(err, 'api/admin/weather-thresholds:get');
  }
}

export async function POST(req: Request) {
  const auth = await apiRequireAdmin(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  const result = thresholdSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  try {
    // lokasyonAd unique
    const existing = await prisma.weatherThreshold.findUnique({
      where: { locationName: result.data.locationName },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, errors: { locationName: 'That location name is already registered.' }, error: 'That location name is already registered.' },
        { status: 409 }
      );
    }

    const threshold = await prisma.weatherThreshold.create({ data: result.data });
    return NextResponse.json({ ok: true, threshold }, { status: 201 });
  } catch (err) {
    return apiServerError(err, 'api/admin/weather-thresholds:post');
  }
}
