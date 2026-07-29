/**
 * /api/admin/pilots
 *
 * GET  – pilot list (staff)
 * POST – create a pilot (staff)
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

export const dynamic = 'force-dynamic';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  specialty: z.string().trim().min(1).max(200),
  specialtyTr: z.string().trim().max(200).nullish(),
  experienceYears: z.number().int().min(0).max(80),
  licence: z.string().trim().max(300).nullable().optional(),
  languages: z.array(z.string().trim().min(1).max(10)).max(10).default([]),
  photoUrl: z.string().trim().url().nullable().optional(),
  bio: z.string().trim().min(1).max(2000),
  bioTr: z.string().trim().max(2000).nullish(),
  active: z.boolean().default(true),
});

export async function GET(req: Request) {
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const url = new URL(req.url);
  const activeParam = url.searchParams.get('active');
  const where = activeParam === 'true' || activeParam === 'false'
    ? { active: activeParam === 'true' }
    : {};

  try {
    const pilots = await prisma.pilot.findMany({
      where,
      orderBy: [{ name: 'asc' }],
    });
    return NextResponse.json({ ok: true, pilots });
  } catch (err) {
    return apiServerError(err, 'api/admin/pilots:get');
  }
}

export async function POST(req: Request) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }
  const body = bodyCheck.data;

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  try {
    const pilot = await prisma.pilot.create({ data: result.data });
    return NextResponse.json({ ok: true, pilot }, { status: 201 });
  } catch (err) {
    return apiServerError(err, 'api/admin/pilots:post');
  }
}
