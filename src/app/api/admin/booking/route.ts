/**
 * GET /api/admin/booking
 *
 * Booking list (filters plus pagination). Requires staff (ADMIN/OPERATOR).
 *
 * Query parameters:
 *  - status: a BookingStatus value (PENDING | CONFIRMED | POSTPONED | CANCELLED | COMPLETED)
 *  - start, end: ISO dates (a preferredDate range)
 *  - q: search across name, phone and e-mail
 *  - page: 1-based page number (defaults to 1)
 *  - perPage: records per page (defaults to 20, max 100)
 *  - sort: field (createdAt | preferredDate), defaulting to createdAt desc
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff } from '@/lib/admin-auth';
import { apiError, apiServerError } from '@/lib/api-error';
import type { Prisma, BookingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'POSTPONED',
  'CANCELLED',
  'COMPLETED',
];

export async function GET(req: Request) {
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  const q = url.searchParams.get('q')?.trim();
  const pageRaw = Number(url.searchParams.get('page') ?? '1');
  const adetRaw = Number(url.searchParams.get('perPage') ?? '20');
  const sortBy = url.searchParams.get('sort') === 'preferredDate'
    ? 'preferredDate'
    : 'createdAt';

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const adet = Number.isFinite(adetRaw) && adetRaw > 0
    ? Math.min(Math.floor(adetRaw), 100)
    : 20;

  const where: Prisma.BookingWhereInput = {};

  if (status && (VALID_STATUSES as string[]).includes(status)) {
    where.status = status as BookingStatus;
  }

  // Date range (preferredDate)
  const startDate: Date | undefined = start ? new Date(start) : undefined;
  const endDate: Date | undefined = end ? new Date(end) : undefined;
  if (startDate || endDate) {
    where.preferredDate = {};
    if (startDate && Number.isFinite(startDate.getTime())) {
      where.preferredDate.gte = startDate;
    }
    if (endDate && Number.isFinite(endDate.getTime())) {
      // Add a day so the end date is inclusive (through 23:59)
      endDate.setDate(endDate.getDate() + 1);
      where.preferredDate.lt = endDate;
    }
  }

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.BookingOrderByWithRelationInput[] =
    sortBy === 'preferredDate'
      ? [{ preferredDate: 'asc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }];

  try {
    const [total, records] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy,
        skip: (page - 1) * adet,
        take: adet,
        include: { package: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      total,
      page,
      adet,
      pageCount: Math.max(1, Math.ceil(total / adet)),
      records,
    });
  } catch (err) {
    return apiServerError(err, 'api/admin/booking:get');
  }
}
