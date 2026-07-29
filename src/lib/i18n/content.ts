import { DEFAULT_LOCALE, type Locale } from './locales';

/**
 * Locale selection for database content.
 *
 * Package/Faq/Pilot rows keep two copies of their editable copy: a required
 * base column in the default locale (`name`, `question`, …) and an optional
 * translation (`nameTr`, `questionTr`, …). The default locale therefore reads
 * straight from the base column and never needs a translation to exist.
 *
 * An untranslated record falls back to the base column rather than rendering
 * blank, so adding a row before translating it is safe.
 */
export function localizedText(
  locale: Locale | string,
  base: string,
  translated?: string | null
): string {
  if (locale !== DEFAULT_LOCALE && translated && translated.trim().length > 0) {
    return translated;
  }
  return base;
}

/** The same rule for array fields (a package's inclusions, say). */
export function localeList(
  locale: Locale | string,
  base: string[],
  translated?: string[] | null
): string[] {
  if (locale !== DEFAULT_LOCALE && translated && translated.length > 0) {
    return translated;
  }
  return base;
}
