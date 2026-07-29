/**
 * /api/admin/pilots/[id]
 *
 * GET    – a single pilot (staff)
 * PUT    – update (staff)
 * DELETE – delete (staff)
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
  specialty: z.string().trim().min(1).max(200).optional(),
  specialtyTr: z.string().trim().max(200).nullish(),
  experienceYears: z.number().int().min(0).max(80).optional(),
  licence: z.string().trim().max(300).nullable().optional(),
  languages: z.array(z.string().trim().min(1).max(10)).max(10).optional(),
  photoUrl: z.string().trim().url().nullable().optional(),
  bio: z.string().trim().min(1).max(2000).optional(),
  bioTr: z.string().trim().max(2000).nullish(),
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
    const pilot = await prisma.pilot.findUnique({ where: { id: id } });
    if (!pilot) {
      return apiError('Pilot not found.', 404, 'NOT_FOUND');
    }
    return NextResponse.json({ ok: true, pilot });
  } catch (err) {
    return apiServerError(err, 'api/admin/pilots/[id]:get');
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
    const pilot = await prisma.pilot.update({
      where: { id: id },
      data: result.data,
    });
    return NextResponse.json({ ok: true, pilot });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Pilot not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/pilots/[id]:put');
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
    await prisma.pilot.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Pilot not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/pilots/[id]:delete');
  }
}
