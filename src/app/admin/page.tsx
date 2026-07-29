/**
 * Admin dashboard (/admin).
 *
 * A server component. The layout's requireStaff already guards it, so no
 * further check is needed here; getSessionUser is only used to show who is
 * signed in.
 *
 * Styling:
 *  - Statistic cards: glass, a gradient accent bar on top, a hover lift and an
 *    animated counter (Framer Motion useMotionValue + animate)
 *  - Recent bookings table
 *  - AdminWeatherSummary in a glass card
 *  - Quick links (a grid with lucide icons)
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AdminWeatherSummary } from '@/components/admin/AdminWeatherSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { CountUp } from '@/components/admin/CountUp';

export const dynamic = 'force-dynamic';

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function todayEnd(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function weekStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 6); // the last seven days, today included
  return d;
}

function trDate(d: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

interface Stat {
  label: string;
  value: number;
  icon: IconName;
  accent: string; // gradient class (accent bar)
  valueColour: string;
}

export default async function AdminDashboardPage() {
  const user = await getSessionUser();

  const [
    pendingCount,
    todayCount,
    weekConfirmedCount,
    completedCount,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({
      where: { preferredDate: { gte: todayStart(), lte: todayEnd() } },
    }),
    prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        preferredDate: { gte: weekStart(), lte: todayEnd() },
      },
    }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { package: { select: { name: true } } },
    }),
  ]);

  const stats: Stat[] = [
    {
      label: 'Pending bookings',
      value: pendingCount,
      icon: 'Clock',
      accent: 'from-yellow-400 to-sunset-400',
      valueColour: 'text-yellow-600',
    },
    {
      label: 'Flights today',
      value: todayCount,
      icon: 'Plane',
      accent: 'from-sky-400 to-blue-500',
      valueColour: 'text-sky-600',
    },
    {
      label: 'Confirmed this week',
      value: weekConfirmedCount,
      icon: 'CalendarCheck',
      accent: 'from-green-400 to-emerald-500',
      valueColour: 'text-green-600',
    },
    {
      label: 'Completed flights',
      value: completedCount,
      icon: 'BadgeCheck',
      accent: 'from-navy-600 to-navy-800',
      valueColour: 'text-navy-700',
    },
  ];

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Hello{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm text-navy-500">
            An overview of the admin panel.
          </p>
        </div>
      </Reveal>

      {/* Statistic cards — gradient accent bar, hover lift, animated counter */}
      <RevealGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            variant="glass"
            interactive
            className="group relative overflow-hidden pt-0"
          >
            {/* Gradient accent bar on top */}
            <div
              className={`h-1 w-full bg-gradient-to-r ${s.accent}`}
              aria-hidden="true"
            />
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-navy-500">{s.label}</p>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${s.accent} text-white opacity-80 transition-opacity group-hover:opacity-100`}
                >
                  <Icon name={s.icon} className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <CountUp
                target={s.value}
                className={`font-display text-3xl font-bold ${s.valueColour}`}
              />
            </CardContent>
          </Card>
        ))}
      </RevealGroup>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Son rezervasyonlar — premium */}
        <Reveal className="lg:col-span-2">
          <Card variant="glass" className="overflow-hidden">
            <CardHeader className="flex items-center justify-between border-navy-100 bg-sand-100/40">
              <CardTitle>Recent bookings</CardTitle>
              <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
              >
                View all
                <Icon name="ArrowRight" className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentBookings.length === 0 ? (
                <EmptyState
                  icon="CalendarCheck"
                  title="No bookings yet"
                  description="New requests will appear here."
                  className="rounded-none border-0 shadow-none"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-100 bg-sand-100/40 text-left text-xs text-navy-500">
                        <th className="px-5 py-2 font-medium">Full name</th>
                        <th className="px-5 py-2 font-medium">Date</th>
                        <th className="px-5 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((r) => (
                        <tr
                          key={r.id}
                          className="group border-b border-navy-50 transition-colors last:border-0 hover:bg-sky-50/50"
                        >
                          <td className="px-5 py-3">
                            <Link
                              href={`/admin/bookings/${r.id}`}
                              className="font-medium text-navy-800 transition-colors group-hover:text-sky-600"
                            >
                              {r.fullName}
                            </Link>
                            <p className="text-xs text-navy-400">
                              {r.package?.name ?? '—'}
                            </p>
                          </td>
                          <td className="px-5 py-3 text-navy-600">
                            {trDate(r.preferredDate)}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={r.status} pulse={r.status === 'PENDING'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>

        {/* Weather summary — glass card */}
        <Reveal delay={0.1}>
          <AdminWeatherSummary />
        </Reveal>
      </div>

      {/* Quick links — a grid with lucide icons */}
      <Reveal>
        <Card variant="glass">
          <CardHeader className="border-navy-100 bg-sand-100/40">
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <QuickLink href="/admin/bookings" label="Bookings" icon="CalendarCheck" />
            <QuickLink href="/admin/packages" label="Packages" icon="Package" />
            <QuickLink href="/admin/pilots" label="Pilots" icon="Users" />
            <QuickLink href="/admin/faq" label="FAQ" icon="HelpCircle" />
            <QuickLink href="/admin/settings" label="Contact / settings" icon="Settings" />
            {user?.role === 'ADMIN' ? (
              <>
                <QuickLink href="/admin/weather-thresholds" label="Weather thresholds" icon="Cloud" />
                <QuickLink href="/admin/users" label="Users" icon="UserCog" />
              </>
            ) : null}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: IconName;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-navy-100 bg-white/50 px-4 py-3 text-sm font-medium text-navy-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-navy-100 to-sand-200 text-navy-600 transition-colors group-hover:from-sky-100 group-hover:to-sky-200 group-hover:text-sky-700">
        <Icon name={icon} className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="flex-1">{label}</span>
      <Icon
        name="ArrowRight"
        className="h-3.5 w-3.5 -translate-x-1 text-navy-300 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-sky-500 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}
