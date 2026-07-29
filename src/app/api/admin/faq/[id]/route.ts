/**
 * /api/admin/faq/[id]
 *
 * PUT    – update (staff)
 * DELETE – delete (staff)
 * (No GET is needed; the list endpoint covers it.)
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
  question: z.string().trim().min(3).max(300).optional(),
  questionTr: z.string().trim().max(300).nullish(),
  answer: z.string().trim().min(1).max(5000).optional(),
  answerTr: z.string().trim().max(5000).nullish(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

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
    const faq = await prisma.faq.update({
      where: { id: id },
      data: result.data,
    });
    return NextResponse.json({ ok: true, faq });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Record not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/faq/[id]:put');
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
    await prisma.faq.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('Record not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/faq/[id]:delete');
  }
}
