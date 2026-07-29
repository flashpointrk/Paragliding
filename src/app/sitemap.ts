import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { LOCALES, DEFAULT_LOCALE, localePath } from '@/lib/i18n/locales';

/**
 * Sitemap. Lists every static public page plus the active packages from the
 * database. Generated at build time.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, '');
  const now = new Date();

  const staticPages: {
    path: string;
    changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: number;
  }[] = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/tandem-flight', changeFrequency: 'monthly', priority: 0.9 },
    {
      path: '/take-off-site/gokova-oren-alatepe-paragliding',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { path: '/packages-and-prices', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/safety', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/gallery', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/about-us', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/our-pilots', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/booking', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/live-conditions', changeFrequency: 'daily', priority: 0.8 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    {
      path: '/terms-of-sale',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    { path: '/cookie-policy', changeFrequency: 'yearly', priority: 0.3 },
  ];

  /** Absolute addresses in every locale for one source path. */
  const localeUrls = (trPath: string) =>
    Object.fromEntries(
      LOCALES.map((d) => [d, `${base}${localePath(d, trPath)}`])
    ) as Record<string, string>;

  // Each page is listed in both locales; `alternates.languages` tells the
  // search engine which translations correspond.
  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((s) => {
    const languages = localeUrls(s.path);
    return LOCALES.map((d) => ({
      url: languages[d]!,
      lastModified: now,
      changeFrequency: s.changeFrequency,
      // English pages carry slightly lower priority (the primary market is Turkish).
      priority: d === DEFAULT_LOCALE ? s.priority : Math.max(0.1, s.priority - 0.1),
      alternates: { languages: languages },
    }));
  });

  // Packages are currently listed on the single /packages-and-prices page and
  // get no URLs of their own. Should package detail pages appear, add one
  // record per locale here with `prisma.package.findMany`.

  return staticEntries;
}
