'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { easeSmooth } from '@/lib/motion';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export interface NavLink {
  label: string;
  href: string;
  /** Optional icon for the mega menu and mobile. */
  icon?: IconName;
  /** Optional short description for the mega menu. */
  desc?: string;
}

export interface NavGroup {
  label: string;
  children: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export function navItemIsGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

/** Legacy name — a plain link. */
export type MobileMenuItem = NavLink;

/**
 * Mobile menu — the "Open Sky" design language. A plain solid white panel.
 *
 * - Simple fade plus slide (NO glass, spring or stagger)
 * - Lucide Menu/X icons
 * - Closes on ESC and on a backdrop click
 * - Accessible: aria-expanded, aria-controls, aria-label and focus management
 */
function MenuLink({
  item,
  onNavigate,
}: {
  item: NavLink;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-navy-700 transition-colors hover:bg-navy-50 hover:text-navy-900"
    >
      {item.icon ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-sky-600">
          <Icon name={item.icon} className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}
      <span className="flex-1">{item.label}</span>
      <Icon
        name="ArrowRight"
        className="h-4 w-4 -translate-x-1 text-navy-300 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-brand-700 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

export function MobileMenu({ items }: { items: NavItem[] }) {
  const { s: sz } = useDictionary();
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // The overlay is portalled to the body. The header uses `backdrop-blur`, and
  // backdrop-filter creates a containing block for fixed-position descendants,
  // so without the portal the panel would be trapped at the header's height.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Close on ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    // Scroll kilitle
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? sz.header.closeMenu : sz.header.menuAc}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 transition-colors hover:bg-navy-50 hover:text-sky-600 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Icon name={open ? 'X' : 'Menu'} className="h-5 w-5" aria-hidden="true" />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeSmooth }}
          >
            {/* Arka plan karartma */}
            <m.div
              className="absolute inset-0 bg-navy-950/50"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in panel */}
            <m.div
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: easeSmooth }}
            >
              <div className="flex h-full flex-col bg-white shadow-soft-lg">
                {/* Top bar — close */}
                <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
                  <span className="font-display text-base font-bold text-navy-900">
                    {sz.common.menu}
                  </span>
                  <button
                    type="button"
                    aria-label={sz.header.closeMenu}
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 transition-colors hover:bg-navy-50 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <Icon name="X" className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Nav linkler */}
                <nav
                  aria-label={sz.common.mobileMainMenu}
                  className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4"
                >
                  {items.map((item) =>
                    navItemIsGroup(item) ? (
                      <div key={item.label} className="mt-2 flex flex-col gap-0.5">
                        <span className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                          {item.label}
                        </span>
                        {item.children.map((alt) => (
                          <MenuLink key={alt.href} item={alt} onNavigate={() => setOpen(false)} />
                        ))}
                      </div>
                    ) : (
                      <MenuLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
                    )
                  )}
                </nav>

                {/* Alt CTA */}
                <div className="border-t border-sand-200 px-5 py-5">
                  <Link
                    href="/booking"
                    onClick={() => setOpen(false)}
                    className="block"
                  >
                    <Button variant="primary" size="lg" className="w-full gap-2">
                      <Icon name="CalendarCheck" className="h-5 w-5" aria-hidden="true" />
                      Booking Yap
                    </Button>
                  </Link>
                </div>
              </div>
            </m.div>
          </m.div>
        ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
