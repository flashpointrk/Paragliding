import { trSlugs } from '@/messages/tr';
import { DEFAULT_LOCALE, type Locale } from './locales';

/**
 * Per-locale URL slugs.
 *
 * Route folders are named with the English slugs, and English is the default
 * locale, so English URLs need no translation at all. Turkish pages live under
 * the `/tr` prefix with their own slugs, and `middleware.ts` rewrites those
 * onto the English folder internally.
 *
 * Example: `/tr/galeri` → (rewrite) `/tr/gallery`
 *
 * The slug tables themselves live with the rest of each locale's copy in
 * `src/messages`, so this module stays free of localized strings. A path with
 * no entry falls back to the English slug in both locales — a safe default
 * rather than a broken link.
 */
const SLUGS: Record<Locale, Record<string, string>> = {
  en: {},
  tr: trSlugs,
};

/** Reverse tables: localized slug → English (folder) slug. */
const REVERSE: Record<Locale, Record<string, string>> = Object.fromEntries(
  (Object.keys(SLUGS) as Locale[]).map((locale) => [
    locale,
    Object.fromEntries(
      Object.entries(SLUGS[locale]).map(([source, localized]) => [localized, source])
    ),
  ])
) as Record<Locale, Record<string, string>>;

/** Translates an English (source) path into the target locale's slug. */
export function localizedSlug(locale: Locale, sourcePath: string): string {
  if (locale === DEFAULT_LOCALE) return sourcePath;
  return SLUGS[locale][sourcePath] ?? sourcePath;
}

/** Translates a localized path (locale prefix already stripped) back to the source slug. */
export function sourceSlug(locale: Locale, localizedPath: string): string {
  if (locale === DEFAULT_LOCALE) return localizedPath;
  return REVERSE[locale][localizedPath] ?? localizedPath;
}

/**
 * Every localized slug that should permanently redirect to its prefixed form.
 *
 * Turkish pages used to be served without a prefix (`/galeri`). Now that
 * English is the default those addresses must not 404 or serve English copy —
 * they redirect to `/tr/...` so existing links and search results keep working.
 */
export const LEGACY_TR_PATHS: Record<string, string> = Object.fromEntries(
  Object.values(trSlugs).map((slug) => [slug, `/tr${slug}`])
);
