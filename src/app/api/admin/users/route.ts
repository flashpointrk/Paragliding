/**
 * /api/admin/users  (ADMIN ONLY)
 *
 * GET  – user list (excluding passwordHash)
 * POST – create a user (with a bcrypt hash)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { apiRequireAdmin } from '@/lib/admin-auth';
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
  email: z.string().trim().email().max(120),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(200),
  role: z.enum(['ADMIN', 'OPERATOR']).default('OPERATOR'),
});

export async function GET() {
  const auth = await apiRequireAdmin();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return NextResponse.json({ ok: true, users });
  } catch (err) {
    return apiServerError(err, 'api/admin/users:get');
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

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  const email = result.data.email.toLowerCase();

  try {
    // Unique kontrol
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, errors: { email: 'That e-mail is already registered.' }, error: 'That e-mail is already registered.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(result.data.password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: result.data.name,
        passwordHash,
        role: result.data.role,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    return apiServerError(err, 'api/admin/users:post');
  }
}
