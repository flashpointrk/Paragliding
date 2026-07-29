'use client';

import * as React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import {
  LOCALES,
  LOCALE_LABEL,
  localePath,
  localeFromPath,
  type Locale,
} from '@/lib/i18n/locales';
import { useDictionary } from '@/lib/i18n/useDictionary';

/**
 * Locale switcher — a dropdown with flags.
 *
 * Goes to the same page in the other locale, preserving the path. It uses
 * `next/link` directly: the target is already a full path, so `LocaleLink`
 * must not prefix it a second time.
 *
 * The flags are emoji (regional indicator letters), so there is no extra file
 * or request.
 */
const FLAG: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const { path } = localeFromPath(pathname);
  const { locale: active, s } = useDictionary();
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function clickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function escapePress(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', clickOutside);
    document.addEventListener('keydown', escapePress);
    return () => {
      document.removeEventListener('mousedown', clickOutside);
      document.removeEventListener('keydown', escapePress);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={s.header.pickLocale}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
          open
            ? 'bg-sand-100 text-navy-900'
            : 'text-navy-600 hover:bg-sand-100 hover:text-navy-900'
        )}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {FLAG[active]}
        </span>
        <span className="uppercase">{active}</span>
        <Icon
          name="ChevronDown"
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[9rem] overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-soft-lg"
        >
          {LOCALES.map((d: Locale) => {
            const selected = d === active;
            return (
              <NextLink
                key={d}
                href={localePath(d, path)}
                hrefLang={d}
                role="menuitem"
                aria-current={selected ? 'true' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                  selected
                    ? 'bg-sand-50 font-semibold text-navy-900'
                    : 'text-navy-600 hover:bg-sand-50 hover:text-navy-900'
                )}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {FLAG[d]}
                </span>
                {LOCALE_LABEL[d]}
                {selected ? (
                  <Icon
                    name="Check"
                    className="ml-auto h-4 w-4 text-sky-600"
                    aria-hidden="true"
                  />
                ) : null}
              </NextLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
