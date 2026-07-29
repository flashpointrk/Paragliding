/**
 * Booking list (/admin/bookings).
 *
 * A server component. Filtering, sorting and pagination all come from URL query
 * parameters:
 *  - status, start, end, q (filters)
 *  - page (1-based)
 *  - sort: createdAt (desc) | preferredDate (asc)
 *
 * The filter form (BookingFilter) is a client component that updates the URL,
 * which re-renders this page on the server. Twenty records per page.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Prisma, BookingStatus } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { BookingFilter } from './BookingFilter';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'POSTPONED',
  'CANCELLED',
  'COMPLETED',
];

const ADET = 20;

function trDate(d: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function buildPageHref(params: URLSearchParams, page: number): string {
  const next = new URLSearchParams(params);
  if (page > 1) next.set('page', String(page));
  else next.delete('page');
  const s = next.toString();
  return s ? `/admin/bookings?${s}` : '/admin/bookings';
}

export default async function BookingListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === 'string') sp.set(k, v);
  }

  const status = sp.get('status');
  const start = sp.get('start');
  const end = sp.get('end');
  const q = sp.get('q')?.trim();
  const sortBy = sp.get('sort') === 'preferredDate' ? 'preferredDate' : 'createdAt';
  const pageRaw = Number(sp.get('page') ?? '1');
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const where: Prisma.BookingWhereInput = {};

  if (status && (VALID_STATUSES as string[]).includes(status)) {
    where.status = status as BookingStatus;
  }

  if (start) {
    const d = new Date(start);
    if (Number.isFinite(d.getTime())) {
      where.preferredDate = { ...(where.preferredDate as object), gte: d };
    }
  }
  if (end) {
    const d = new Date(end);
    if (Number.isFinite(d.getTime())) {
      d.setDate(d.getDate() + 1);
      where.preferredDate = { ...(where.preferredDate as object), lt: d };
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

  const [total, records] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy,
      skip: (page - 1) * ADET,
      take: ADET,
      include: { package: { select: { name: true } } },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / ADET));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Bookings</h1>
          <p className="text-sm text-navy-500">
            {total} record(s){pageCount > 1 ? ` · Page ${page}/${pageCount}` : ''}
          </p>
        </div>
        <Link
          href="/api/admin/booking/export"
          className="text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          Download CSV (all) →
        </Link>
      </div>

      <Suspense fallback={<div className="h-32 rounded-xl bg-navy-50 animate-pulse" />}>
        <BookingFilter />
      </Suspense>

      <Card>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-navy-400">
              No bookings match the filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50/50 text-left text-xs text-navy-500">
                    <th className="px-4 py-3 font-semibold">Full name</th>
                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">Package</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-navy-50 last:border-0 hover:bg-navy-50/40"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/bookings/${r.id}`}
                          className="font-medium text-navy-800 hover:text-sky-600"
                        >
                          {r.fullName}
                        </Link>
                        <p className="text-xs text-navy-400">{r.email}</p>
                      </td>
                      <td className="px-4 py-3 text-navy-600 hidden sm:table-cell">
                        {r.package?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-navy-600">
                        {trDate(r.preferredDate)}
                        {r.preferredTime ? (
                          <span className="block text-xs text-navy-400">
                            {r.preferredTime}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-navy-600 hidden md:table-cell">
                        {r.phone}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link
              href={buildPageHref(sp, page - 1)}
              className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm text-navy-700 hover:bg-navy-50"
            >
              ← Previous
            </Link>
          ) : null}
          <span className="text-sm text-navy-500">
            {page} / {pageCount}
          </span>
          {page < pageCount ? (
            <Link
              href={buildPageHref(sp, page + 1)}
              className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm text-navy-700 hover:bg-navy-50"
            >
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
