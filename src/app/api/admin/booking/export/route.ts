/**
 * GET /api/admin/booking/export
 *
 * Exports the booking list as CSV. Staff only.
 *
 * Query parameters (the same as the booking list):
 *  - status, start, end, q
 *
 * CSV details:
 *  - A UTF-8 BOM, so Excel renders non-ASCII characters correctly
 *  - Localized column headings
 *  - Dates in DD.MM.YYYY HH:mm
 *  - Content-Disposition: attachment
 *  - Commas, quotes and line breaks inside values are CSV-escaped
 */

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

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  POSTPONED: 'Postponed',
  CANCELLED: 'Cancel',
  COMPLETED: 'Completed',
};

const MEDIA_LABEL: Record<string, string> = {
  none: 'None',
  photo: 'Foto',
  'photo-video': 'Photo + video',
};

/** Escapes a CSV cell: wrap in quotes and double any quote inside. */
function csvCell(value: unknown): string {
  if (value == null) return '';
  const ham = String(value);
  // Stop Excel/LibreOffice from evaluating formulas: when external text
  // starts with =, +, - or @, mark the cell as text.
  const s = /^[=+\-@]/.test(ham) ? `'${ham}` : ham;
  // Quote when a comma, a quote or a line break is present
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Localized date format: DD.MM.YYYY HH:mm */
function trDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function trDateShort(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export async function GET(req: Request) {
  const auth = await apiRequireStaff();
  if (!auth.ok) {
    return new Response(JSON.stringify({ ok: false, error: auth.message }), {
      status: auth.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  const q = url.searchParams.get('q')?.trim();

  const where: Prisma.BookingWhereInput = {};

  if (status && (VALID_STATUSES as string[]).includes(status)) {
    where.status = status as BookingStatus;
  }

  const startDate: Date | undefined = start ? new Date(start) : undefined;
  const endDate: Date | undefined = end ? new Date(end) : undefined;
  if (startDate || endDate) {
    where.preferredDate = {};
    if (startDate && Number.isFinite(startDate.getTime())) {
      where.preferredDate.gte = startDate;
    }
    if (endDate && Number.isFinite(endDate.getTime())) {
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

  let records;
  try {
    records = await prisma.booking.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: { package: { select: { name: true } } },
    });
  } catch (err) {
    return apiServerError(err, 'api/admin/booking/export:get');
  }

  const titles = [
    'Referans',
    'Status',
    'Full name',
    'Phone',
    'E-mail',
    'Package',
    'Preferred date',
    'Preferred time',
    'Guests',
    'Weight range',
    'Locale',
    'Transfer',
    'Media',
    'Note',
    'Created at',
    'KVKK',
    'Explicit consent',
  ];

  const rows: string[] = [];

  // Header row
  rows.push(titles.map(csvCell).join(','));

  for (const r of records) {
    rows.push(
      [
        r.id,
        STATUS_LABEL[r.status],
        r.fullName,
        r.phone,
        r.email,
        r.package?.name ?? '',
        trDateShort(r.preferredDate),
        r.preferredTime ?? '',
        r.guestCount,
        r.weightRange,
        r.locale,
        r.transferRequested ? 'Yes' : 'No',
        r.mediaPreference ? (MEDIA_LABEL[r.mediaPreference] ?? r.mediaPreference) : '',
        r.note ?? '',
        trDate(r.createdAt),
        r.privacyConsent ? 'Yes' : 'No',
        r.explicitConsent ? 'Yes' : 'No',
      ]
        .map(csvCell)
        .join(',')
    );
  }

  // UTF-8 BOM plus the content
  const bom = '\uFEFF';
  const csv = bom + rows.join('\r\n');

  const dateStamp = trDateShort(new Date()).replace(/\./g, '-');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bookings-${dateStamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
