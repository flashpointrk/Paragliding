import { trErrorMessages, trSlotMessages } from '@/messages/tr';
import { CLOSING_MINUTES } from '@/lib/booking/flight-slots';
import { DEFAULT_LOCALE, type Locale } from './locales';

/**
 * Localized wording for the server and schema error messages.
 *
 * Zod schemas and API responses are written once, in the default locale, and
 * both the server and the client share those schemas. Rather than turning every
 * message into a key, the text is translated here — immediately before it is
 * shown to the user. A message with no entry passes through unchanged, so
 * adding one never breaks anything.
 *
 * Each locale keeps its own table with the rest of its copy in `src/messages`,
 * which is what keeps this module free of localized strings.
 */
const TABLES: Record<Exclude<Locale, typeof DEFAULT_LOCALE>, Record<string, string>> = {
  tr: { ...trErrorMessages, ...trSlotMessages(CLOSING_MINUTES) },
};

/** Translates one error message into the active locale, or returns it as-is. */
export function translateError(locale: Locale | string, message: string): string {
  if (locale === DEFAULT_LOCALE) return message;
  const table = TABLES[locale as keyof typeof TABLES];
  return table?.[message] ?? message;
}

/** Translates a whole field → message map. */
export function translateErrors<T extends Record<string, string | undefined>>(
  locale: Locale | string,
  errors: T
): T {
  if (locale === DEFAULT_LOCALE) return errors;
  const out: Record<string, string | undefined> = {};
  for (const [field, message] of Object.entries(errors)) {
    out[field] = message ? translateError(locale, message) : message;
  }
  return out as T;
}
