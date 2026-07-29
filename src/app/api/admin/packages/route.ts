/**
 * /api/admin/packages
 *
 * GET  – package list (staff). The active/inactive filter is optional
 *        (?active=true|false)
 * POST – create a package (staff).
 *
 * Package fields (schema): name, description, content[], showPrice, priceMin?,
 * sortOrder, active.
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
  nameTr: z.string().trim().max(120).nullish(),
  description: z.string().trim().min(1).max(2000),
  descriptionTr: z.string().trim().max(2000).nullish(),
  content: z.array(z.string().trim().min(1)).max(50).default([]),
  contentTr: z.array(z.string().trim().min(1)).max(50).default([]),
  showPrice: z.boolean().default(false),
  priceMin: z.number().int().nonnegative().nullable().optional(),
  sortOrder: z.number().int().default(0),
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
    const packages = await prisma.package.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ ok: true, packages });
  } catch (err) {
    return apiServerError(err, 'api/admin/packages:get');
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
    const pkg = await prisma.package.create({ data: result.data });
    return NextResponse.json({ ok: true, pkg }, { status: 201 });
  } catch (err) {
    return apiServerError(err, 'api/admin/packages:post');
  }
}
