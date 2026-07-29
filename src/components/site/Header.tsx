'use client';

import * as React from 'react';
import { LocaleLink as Link } from '@/components/site/LocaleLink';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  MobileMenu,
  navItemIsGroup,
  type NavItem,
  type NavGroup,
} from '@/components/site/MobileMenu';
import { cn } from '@/lib/utils';
import { socialLinks } from '@/lib/site';
import { useDictionary } from '@/lib/i18n/useDictionary';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { LocaleSwitcher } from '@/components/site/LocaleSwitcher';
import { SocialGlyph } from '@/components/site/SocialGlyph';
import { FALLBACK_IMAGE } from '@/lib/images';
import { BrandMark } from './BrandMark';

/**
 * Site-wide header — the "Open Sky" design language.
 *
 * Plain solid white with a thin bottom hairline, sticky, and an active link
 * marked by a thin gold rule. Secondary pages are collected under a "Discover"
 * dropdown to keep the menu uncluttered, leaving one warm CTA ("Book a
 * Flight", in gold).
 */

/** The menu is built from the dictionary (paths are prefixed by `LocaleLink`). */
function navItems(s: Dictionary): NavItem[] {
  const k = s.header.exploreSub;
  return [
    { label: s.header.home, href: '/' },
    { label: s.header.about, href: '/about-us' },
    {
      label: s.header.explore,
      children: [
        {
          label: k.tandemFlight,
          href: '/tandem-flight',
          icon: 'Navigation',
          desc: k.tandemFlightDescription,
        },
        {
          label: k.flightSite,
          href: '/take-off-site/gokova-oren-alatepe-paragliding',
          icon: 'MapPin',
          desc: k.takeOffSiteDescription,
        },
        {
          label: k.liveStatus,
          href: '/live-conditions',
          icon: 'CloudSun',
          desc: k.liveStatusDescription,
        },
        {
          label: k.safety,
          href: '/safety',
          icon: 'ShieldCheck',
          desc: k.safetyDescription,
        },
        {
          label: k.faq,
          href: '/faq',
          icon: 'HelpCircle',
          desc: k.faqDescription,
        },
      ],
    },
    { label: s.header.packages, href: '/packages-and-prices' },
    { label: s.header.gallery, href: '/gallery' },
    { label: s.header.contact, href: '/contact' },
  ];
}

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function NavDropdown({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const groupActive = group.children.some((c) => isActive(pathname, c.href));
  const { s } = useDictionary();

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      // Spans the header height so there is no dead zone between the button and
      // the panel where the cursor could fall and close the menu.
      className="flex h-full items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
          groupActive || open
            ? 'bg-sand-100 text-navy-900'
            : 'text-navy-600 hover:bg-sand-100 hover:text-navy-900'
        )}
      >
        {group.label}
        <Icon
          name="ChevronDown"
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
        {groupActive ? (
          <span
            aria-hidden="true"
            className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-brand-400"
          />
        ) : null}
      </button>

      {/* The panel aligns to the header container rather than the button (the
          wrapper has no `relative`). The 11rem left edge leaves 1rem of
          clearance over the logo medallion, which is 10rem at its largest. */}
      {open ? (
        <div role="menu" className="absolute left-44 right-0 top-full z-50 pt-2">
          <div className="flex overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft-lg">
            {/* Link list (icon plus description) */}
            <div className="grid flex-1 grid-cols-2 gap-1 p-2">
              {group.children.map((child) => {
                const active = isActive(pathname, child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    role="menuitem"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'group/mi flex items-start gap-3 rounded-xl p-3 transition-colors',
                      active ? 'bg-sand-50' : 'hover:bg-sand-50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-sand-100 text-sky-600 group-hover/mi:bg-sky-50'
                      )}
                    >
                      {child.icon ? (
                        <Icon name={child.icon} className="h-5 w-5" aria-hidden="true" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-navy-900">
                        {child.label}
                      </span>
                      {child.desc ? (
                        <span className="mt-0.5 block text-xs leading-snug text-navy-500">
                          {child.desc}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Featured — photo plus CTA */}
            <div className="relative w-72 shrink-0 overflow-hidden">
              <Image
                src={FALLBACK_IMAGE.menu}
                alt=""
                fill
                sizes="288px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-navy-950/30" aria-hidden="true" />
              <div className="absolute inset-0 flex flex-col justify-end gap-2.5 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
                  {s.header.featured.label}
                </p>
                <p className="font-display text-lg font-bold leading-snug text-white">
                  {s.header.featured.title}
                </p>
                <Link
                  href="/booking"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-flex h-9 w-fit items-center gap-1.5 rounded-full bg-brand-400 px-4 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-500"
                >
                  {s.common.submitBooking}
                  <Icon name="ArrowRight" className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const socials = socialLinks();
  const { s, locale } = useDictionary();
  const NAV_ITEMS = navItems(s);
  // The active check runs without the locale prefix.
  const path = locale === 'tr' ? pathname : pathname.replace(/^\/en/, '') || '/';
  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container relative flex h-20 items-center justify-between gap-4">
        {/* Logo / brand — a horizontal lockup that stays inside the header.
            It shrinks a notch on scroll. */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={s.header.homeLink}
        >
          <BrandMark
            className="flex items-center gap-2.5 text-navy-950"
            glyphClassName="h-9 w-auto sm:h-10"
            wordmarkClassName="font-display text-lg font-extrabold uppercase tracking-tight sm:text-xl"
          />
        </Link>

        {/* Desktop menu */}
        <nav className="hidden h-full items-center gap-0.5 lg:flex" aria-label={s.header.anaMenu}>
          {NAV_ITEMS.map((item) =>
            navItemIsGroup(item) ? (
              <NavDropdown key={item.label} group={item} pathname={path} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(path, item.href) ? 'page' : undefined}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                  isActive(path, item.href)
                    ? 'bg-sand-100 text-navy-900'
                    : 'text-navy-600 hover:bg-sand-100 hover:text-navy-900'
                )}
              >
                {item.label}
                {isActive(path, item.href) ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-brand-400"
                  />
                ) : null}
              </Link>
            )
          )}
        </nav>

        {/* Right-hand action */}
        <div className="flex items-center gap-2">
          {/* Social media — only the accounts that are configured */}
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-navy-500 transition-colors duration-200 hover:bg-sand-100 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:inline-flex"
            >
              <SocialGlyph name={s.name} className="h-5 w-5" />
            </a>
          ))}
          <Link href="/booking" className="hidden sm:inline-block">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Icon name="CalendarCheck" className="h-4 w-4" aria-hidden="true" />
              {s.common.submitBooking}
            </Button>
          </Link>
          <LocaleSwitcher className="hidden sm:block" />
          <MobileMenu items={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}
