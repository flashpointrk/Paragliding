'use client';

import * as React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { localeFromPath, localePath } from '@/lib/i18n/locales';

/**
 * Locale-aware link.
 *
 * Prefixes site-internal paths with the current locale: on `/tr/galeri`, a link
 * to `/packages-and-prices` becomes `/tr/paketler-ve-fiyatlar`. External links
 * (http, mailto, tel, #) pass through untouched.
 *
 * Usage: `import { LocaleLink as Link }` in a page — existing `<Link>` calls
 * gain locale support without changing.
 */
export type LinkProps = React.ComponentProps<typeof NextLink>;

function isExternalLink(href: string): boolean {
  return (
    href.startsWith('http') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  );
}

export function LocaleLink({ href, ...props }: LinkProps) {
  const pathname = usePathname() ?? '/';
  const { locale } = localeFromPath(pathname);

  if (typeof href !== 'string' || isExternalLink(href)) {
    return <NextLink href={href} {...props} />;
  }

  return <NextLink href={localePath(locale, href)} {...props} />;
}
