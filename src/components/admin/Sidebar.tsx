'use client';

/**
 * Admin sidebar navigation.
 *
 * - Glass-dark (bg-navy-900/80 backdrop-blur) with a subtle right border
 * - Logo at the top (logo.png)
 * - Nav links: lucide icons, with a slide-right and sky glow on hover
 * - Active = gradient left border plus a glass-light background
 * - Role-based link filtering (ADMIN only)
 * - "Coming soon" placeholder links are disabled
 * - Mobile drawer slides in (AnimatePresence)
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AnimatePresence, m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/site';
import { Icon, type IconName } from '@/components/ui/Icon';
import { easeSmooth, easeSpring } from '@/lib/motion';
import { BrandGlyph } from '@/components/site/BrandMark';

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  adminOnly?: boolean;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'CalendarCheck' },
  { href: '/admin/page-content', label: 'Page content', icon: 'FileCheck' },
  { href: '/admin/media', label: 'Media library', icon: 'Image' },
  { href: '/admin/packages', label: 'Packages', icon: 'Package' },
  { href: '/admin/pilots', label: 'Pilots', icon: 'Users' },
  { href: '/admin/weather-thresholds', label: 'Weather thresholds', icon: 'Cloud', adminOnly: true },
  { href: '/admin/faq', label: 'FAQ', icon: 'HelpCircle' },
  { href: '/admin/settings', label: 'Contact / settings', icon: 'Settings' },
  { href: '/admin/gallery', label: 'Gallery', icon: 'Camera' },
  { href: '/admin/users', label: 'Users', icon: 'UserCog', adminOnly: true },
];

interface SidebarProps {
  role: 'ADMIN' | 'OPERATOR';
  userName?: string | null;
  userEmail?: string | null;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((item) => !item.adminOnly || role === 'ADMIN');

  const navList = (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {items.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

        if (item.soon) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              title="Coming soon"
              className="group flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy-400"
            >
              <Icon
                name={item.icon}
                className="h-5 w-5 shrink-0 text-navy-500"
                aria-hidden="true"
              />
              <span>{item.label}</span>
              <span className="ml-auto rounded-full bg-navy-700/60 px-2 py-0.5 text-[10px] font-medium text-navy-300">
                coming soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              active
                ? 'glass-light bg-sky-500/10 text-white shadow-inner-glass'
                : 'text-navy-200 hover:-translate-x-0.5 hover:bg-white/5 hover:text-white'
            )}
          >
            {/* Active: gradient left border */}
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-1.5 left-0 w-1 origin-top rounded-full bg-gradient-to-b from-sky-400 to-sunset-400"
              />
            ) : null}
            <Icon
              name={item.icon}
              className={cn(
                'h-5 w-5 shrink-0 transition-colors',
                active
                  ? 'text-sky-300'
                  : 'text-navy-300 group-hover:text-sky-300'
              )}
              aria-hidden="true"
            />
            <span>{item.label}</span>
            {/* Sky glow on hover, to the right */}
            {!active ? (
              <span
                aria-hidden="true"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400 opacity-0 shadow-glow-sky transition-opacity duration-200 group-hover:opacity-100"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const brandBlock = (
    <Link href="/admin" className="group flex items-center gap-3 px-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
        <BrandGlyph className="h-6 w-auto transition-transform duration-300 group-hover:scale-110" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-sm font-bold text-white">
          {SITE.shortName}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-sky-300">
          Admin panel
        </span>
      </span>
    </Link>
  );

  const userBlock = (
    <div className="mt-auto">
      <div className="glass-light rounded-xl p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sunset-500 text-sm font-bold text-white">
            {(userName ?? 'K').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {userName ?? 'User'}
            </p>
            <p className="truncate text-xs text-navy-300">{userEmail ?? ''}</p>
          </div>
        </div>
        <span className="mt-2 inline-flex rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-300 ring-1 ring-inset ring-sky-400/30">
          {role === 'ADMIN' ? 'Admin' : 'Operator'}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-navy-200 transition-colors hover:bg-red-500/15 hover:text-red-300"
        >
          <Icon name="LogOut" className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="glass-dark sticky top-0 z-30 flex items-center justify-between border-b border-white/10 px-4 py-3 text-white lg:hidden">
        {brandBlock}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-navy-200 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Icon name="Menu" className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobil drawer — AnimatePresence slide-in */}
      <AnimatePresence>
        {open ? (
          <m.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeSmooth }}
          >
            <div
              className="glass-dark absolute inset-0"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <m.aside
              className="absolute left-0 top-0 flex h-full w-72 flex-col overflow-y-auto border-r border-white/10 bg-navy-900/95 p-4 backdrop-blur-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: easeSpring }}
            >
              <div className="mb-6">{brandBlock}</div>
              <div className="flex flex-1 flex-col">{navList}</div>
              {userBlock}
            </m.aside>
          </m.div>
        ) : null}
      </AnimatePresence>

      {/* Fixed desktop column — glass-dark */}
      <aside className="glass-dark fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-white/10 bg-navy-900/80 p-4 backdrop-blur-xl lg:flex">
        <div className="mb-6">{brandBlock}</div>
        <div className="flex flex-1 flex-col">{navList}</div>
        {userBlock}
      </aside>
    </>
  );
}
