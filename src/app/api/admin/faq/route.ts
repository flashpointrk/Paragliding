/**
 * /api/admin/faq
 *
 * GET  – FAQ list (staff), ordered by sortOrder
 * POST – create an FAQ entry (staff)
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
  question: z.string().trim().min(3).max(300),
  questionTr: z.string().trim().max(300).nullish(),
  answer: z.string().trim().min(1).max(5000),
  answerTr: z.string().trim().max(5000).nullish(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const faq = await prisma.faq.findMany({
      orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
    });
    return NextResponse.json({ ok: true, faq });
  } catch (err) {
    return apiServerError(err, 'api/admin/faq:get');
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
    const record = await prisma.faq.create({ data: result.data });
    return NextResponse.json({ ok: true, faq: record }, { status: 201 });
  } catch (err) {
    return apiServerError(err, 'api/admin/faq:post');
  }
}
