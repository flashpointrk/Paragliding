import { tr } from '@/messages/tr';
import { en } from '@/messages/en';
import { DEFAULT_LOCALE, isValidLocale, type Locale } from './locales';

/**
 * Dictionary access.
 *
 * Server components: `const s = dictionary(locale)` (the locale from
 * `params.locale`).
 * Client components: `useDictionary()` — it reads the locale from the path.
 */

export type Dictionary = typeof tr;

const DICTIONARIES: Record<Locale, Dictionary> = { tr, en };

export function dictionary(locale: string | undefined): Dictionary {
  const d = locale && isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  return DICTIONARIES[d];
}
