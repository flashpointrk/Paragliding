import { prisma } from '@/lib/prisma';
import { isValidLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
import { dictionary, type Dictionary } from '@/lib/i18n/dictionary';
import {
  isDictionarySlug,
  defaultPageContent,
  type PageContentSlug,
  type AnyPageContentSlug,
} from '@/lib/admin/page-content';

type JsonObject = Record<string, unknown>;
type ImageMap = Record<string, string>;

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge<T>(base: T, ek: unknown): T {
  if (!isObject(base) || !isObject(ek)) {
    return (ek === undefined ? base : ek) as T;
  }

  const result: JsonObject = { ...base };
  for (const [key, value] of Object.entries(ek)) {
    result[key] = deepMerge(result[key], value);
  }
  return result as T;
}

function pickLocale(locale: string | undefined): Locale {
  return locale && isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

export async function managedDictionary(locale: string | undefined): Promise<Dictionary> {
  const selectedLocale = pickLocale(locale);
  const base = dictionary(selectedLocale);
  const rows = await prisma.pageContent
    .findMany({
      where: { locale: selectedLocale, active: true },
      select: { slug: true, content: true },
    })
    .catch(() => []);

  let result: Dictionary = { ...base };
  for (const row of rows) {
    if (!isDictionarySlug(row.slug)) continue;
    const slug = row.slug as PageContentSlug;
    result = {
      ...result,
      [slug]: deepMerge(base[slug], row.content),
    };
  }
  return result;
}

export async function pageImages(
  locale: string | undefined,
  slug: AnyPageContentSlug
): Promise<ImageMap> {
  const selectedLocale = pickLocale(locale);
  const record = await prisma.pageContent
    .findUnique({
      where: { slug_locale: { slug, locale: selectedLocale } },
      select: { images: true, active: true },
    })
    .catch(() => null);

  if (!record?.active || !isObject(record.images)) return {};

  const images: ImageMap = {};
  for (const [key, value] of Object.entries(record.images)) {
    if (typeof value === 'string' && value.trim()) {
      images[key] = value.trim();
    }
  }
  return images;
}

export async function managedPageContent<T>(
  locale: string | undefined,
  slug: AnyPageContentSlug
): Promise<T> {
  const selectedLocale = pickLocale(locale);
  const base = defaultPageContent(slug, selectedLocale);
  const record = await prisma.pageContent
    .findUnique({
      where: { slug_locale: { slug, locale: selectedLocale } },
      select: { content: true, active: true },
    })
    .catch(() => null);

  if (!record?.active) return base as T;
  return deepMerge(base, record.content) as T;
}

export function pickImage(
  images: ImageMap,
  key: string,
  fallback: string | null | undefined
): string | null {
  return images[key] ?? fallback ?? null;
}
