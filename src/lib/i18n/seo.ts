import type { Metadata } from 'next';
import { LOCALES, DEFAULT_LOCALE, localePath, isValidLocale } from './locales';

/**
 * Multilingual SEO alternates.
 *
 * `canonical` is the path in the current locale, while `languages` covers every
 * locale (hreflang) with the default-locale version as `x-default`.
 */
export function localeAlternates(
  path: string,
  locale: string
): Metadata['alternates'] {
  const active = isValidLocale(locale) ? locale : DEFAULT_LOCALE;

  const languages: Record<string, string> = {};
  for (const d of LOCALES) languages[d] = localePath(d, path);
  languages['x-default'] = localePath(DEFAULT_LOCALE, path);

  return {
    canonical: localePath(active, path),
    languages,
  };
}
