/**
 * Booking detail (/admin/bookings/[id]).
 *
 * A server component. Loads the booking along with its package and status
 * history (including the user). The status update form is a client component
 * (StatusUpdateForm).
 *
 * Layout: detail cards on the left, status management and the history timeline
 * on the right.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StatusUpdateForm } from './StatusUpdateForm';

export const dynamic = 'force-dynamic';

function trDate(d: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function trDateShort(d: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await prisma.booking.findUnique({
    where: { id },
    include: {
      package: true,
      statusHistory: {
        orderBy: { occurredAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
  });

  if (!r) {
    notFound();
  }

  const details: { label: string; value: string }[] = [
    { label: 'Full name', value: r.fullName },
    { label: 'Phone', value: r.phone },
    { label: 'E-mail', value: r.email },
    { label: 'Package', value: r.package.name },
    { label: 'Preferred date', value: trDateShort(r.preferredDate) },
    {
      label: 'Alternate date',
      value: r.alternateDate ? trDateShort(r.alternateDate) : '—',
    },
    { label: 'Preferred time', value: r.preferredTime ?? '—' },
    { label: 'Guests', value: String(r.guestCount) },
    { label: 'Weight range', value: r.weightRange },
    { label: 'Locale', value: r.locale },
    { label: 'Transfer requested', value: r.transferRequested ? 'Yes' : 'No' },
    { label: 'Media preference', value: r.mediaPreference ?? '—' },
    { label: 'Privacy consent', value: r.privacyConsent ? 'Yes' : 'No' },
    { label: 'Explicit consent', value: r.explicitConsent ? 'Yes' : 'No' },
    {
      label: 'Created',
      value: trDate(r.createdAt),
    },
    { label: 'Updateme', value: trDate(r.updatedAt) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/bookings"
          className="text-sm text-sky-600 hover:text-sky-700"
        >
          ← Back to bookings
        </Link>
        <div className="mt-1 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-navy-900">{r.fullName}</h1>
          <StatusBadge status={r.status} />
        </div>
        <p className="text-xs text-navy-400 mt-1">Ref: {r.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sol: Detaylar + not */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Booking details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt className="text-xs text-navy-400">{d.label}</dt>
                    <dd className="text-sm font-medium text-navy-800">
                      {d.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {r.note ? (
            <Card>
              <CardHeader>
                <CardTitle>Customer note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-navy-700 whitespace-pre-wrap">
                  {r.note}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Status history timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
              {r.statusHistory.length === 0 ? (
                <p className="text-sm text-navy-400">No records.</p>
              ) : (
                <ol className="relative border-l border-navy-100 ml-2 space-y-4">
                  {r.statusHistory.map((g) => (
                    <li key={g.id} className="ml-4">
                      <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-white" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={g.status} />
                        <span className="text-xs text-navy-400">
                          {trDate(g.occurredAt)}
                        </span>
                      </div>
                      {g.note ? (
                        <p className="text-sm text-navy-600 mt-1">{g.note}</p>
                      ) : null}
                      <p className="text-xs text-navy-400 mt-0.5">
                        {g.user
                          ? `${g.user.name ?? g.user.email} (${g.user.role})`
                          : 'Sistem'}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: status management */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Update status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusUpdateForm
                bookingId={r.id}
                currentStatus={r.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <a
                href={`tel:${r.phone}`}
                className="block rounded-lg border border-navy-100 px-3 py-2 text-navy-700 hover:bg-navy-50"
              >
                📞 Call: {r.phone}
              </a>
              <a
                href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-navy-100 px-3 py-2 text-navy-700 hover:bg-navy-50"
              >
                💬 WhatsApp
              </a>
              <a
                href={`mailto:${r.email}`}
                className="block rounded-lg border border-navy-100 px-3 py-2 text-navy-700 hover:bg-navy-50"
              >
                ✉️ E-mail: {r.email}
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
