/**
 * Locale plumbing — dependency free, tailored to this app.
 *
 * URL scheme:
 *  - English (default): no prefix → `/packages-and-prices`
 *  - Turkish:           `/tr` prefix with translated slugs → `/tr/paketler-ve-fiyatlar`
 *
 * Route folders are named with the English slugs. For Turkish the address bar
 * shows the translated slug and `middleware.ts` rewrites it onto the English
 * folder internally.
 */

import { localizedSlug, sourceSlug } from './paths';

export const LOCALES = ['en', 'tr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Full codes for the HTML `lang` attribute and `hreflang`. */
export const LOCALE_CODE: Record<Locale, string> = {
  en: 'en',
  tr: 'tr-TR',
};

/** Labels shown in the locale switcher. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
};

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Turns an English (source) path into the public address for a locale.
 * `localePath('tr', '/gallery')` → `/tr/galeri`
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  const localized = localizedSlug(locale, clean);
  return localized === '/' ? `/${locale}` : `/${locale}${localized}`;
}

/**
 * Extracts the locale and the **English source path** from an address.
 * `/tr/galeri` → { locale: 'tr', path: '/gallery' }
 * `/gallery`   → { locale: 'en', path: '/gallery' }
 *
 * Returning the source path lets links and the locale switcher work off a
 * single key regardless of which locale is being viewed.
 */
export function localeFromPath(pathname: string): { locale: Locale; path: string } {
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0];
  if (first && isValidLocale(first) && first !== DEFAULT_LOCALE) {
    const localized = `/${parts.slice(1).join('/')}`;
    return { locale: first, path: sourceSlug(first, localized) };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' };
}
