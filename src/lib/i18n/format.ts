import { LOCALE_CODE, DEFAULT_LOCALE, type Locale } from './locales';

/**
 * Locale-aware number and time formatting.
 *
 * The Turkish side keeps the familiar "2.500 ₺" rendering, while the English
 * side uses Intl's own currency format ("TRY 2,500") — that way a visitor from
 * abroad is never left guessing which lira is meant.
 */

function localeTag(locale: Locale | string): string {
  return LOCALE_CODE[(locale === 'en' ? 'en' : 'tr') as Locale];
}

/** Formats a price stored in minor units for the given locale. */
export function formatPrice(locale: Locale | string, kurus: number): string {
  const tl = kurus / 100;
  try {
    if (locale === DEFAULT_LOCALE) {
      return `${tl.toLocaleString(localeTag(locale))} ₺`;
    }
    return new Intl.NumberFormat(localeTag(locale), {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(tl);
  } catch {
    return `${tl} ₺`;
  }
}

/** Renders an ISO timestamp as "HH:MM" for the given locale. */
export function formatHour(locale: Locale | string, iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString(localeTag(locale), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '—';
  }
}
