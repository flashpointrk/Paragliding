'use client';

import { usePathname } from 'next/navigation';
import { localeFromPath, type Locale } from './locales';
import { dictionary, type Dictionary } from './dictionary';

/**
 * Locale and dictionary for client components.
 *
 * The locale is read from the address bar (`/tr/...` → tr, otherwise the
 * default), so it never has to be threaded through as a prop.
 */
export function useDictionary(): { locale: Locale; s: Dictionary; path: string } {
  const pathname = usePathname() ?? '/';
  const { locale, path } = localeFromPath(pathname);
  return { locale, s: dictionary(locale), path };
}
