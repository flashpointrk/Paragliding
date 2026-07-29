/**
 * /api/admin/users/[id]  (ADMIN ONLY)
 *
 * PUT    – update the user's details or role. Optional password reset.
 * DELETE – delete a user, with a guard against deleting yourself (session
 *          user.id).
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
  mapPrismaError,
} from '@/lib/api-error';

export const dynamic = 'force-dynamic';

// Maximum body size for admin CRUD (50 KB).
const MAX_BODY_BYTES = 50 * 1024;

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(120).optional(),
  role: z.enum(['ADMIN', 'OPERATOR']).optional(),
  password: z.string().min(8).max(200).optional(),
});

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

  const data: {
    name?: string;
    email?: string;
    role?: 'ADMIN' | 'OPERATOR';
    passwordHash?: string;
  } = {};

  if (result.data.name !== undefined) data.name = result.data.name;
  if (result.data.role !== undefined) data.role = result.data.role;
  if (result.data.email !== undefined) data.email = result.data.email.toLowerCase();
  if (result.data.password) {
    data.passwordHash = await bcrypt.hash(result.data.password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id: id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('User not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/users/[id]:put');
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

  // Kendini silmeyi engelle
  if (id === auth.user.id) {
    return apiError('You cannot delete yourself.', 400, 'CANNOT_DELETE_SELF');
  }

  try {
    await prisma.user.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const matched = mapPrismaError(err);
    if (matched && matched.code === 'NOT_FOUND') {
      return apiError('User not found.', 404, 'NOT_FOUND');
    }
    return apiServerError(err, 'api/admin/users/[id]:delete');
  }
}
