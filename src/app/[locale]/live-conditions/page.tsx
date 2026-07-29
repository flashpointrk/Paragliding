import type { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/site/LocaleLink';
import { LocationWeatherModule } from '@/components/weather/LocationWeatherModule';
import { SITE, LOCATION } from '@/lib/site';
import { wa } from '@/lib/contact-links';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { managedDictionary } from '@/lib/page-content';
import { localePath, LOCALE_CODE, type Locale } from '@/lib/i18n/locales';
import { localeAlternates } from '@/lib/i18n/seo';

/**
 * Live weather and flight conditions page.
 *
 * This page is for planning and information. Microclimate, launch-site
 * conditions and the pilot's own assessment can all change, so what appears
 * here is never a flight clearance on its own.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.liveStatus.metaTitle,
    description: s.liveStatus.metaDescription,
    alternates: localeAlternates('/live-conditions', locale),
    openGraph: {
      title: `${s.liveStatus.metaTitle} | ${s.common.brandName}`,
      description: s.liveStatus.ogDescription,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

/** JSON-LD: WebPage + BreadcrumbList (temel SEO). */
function jsonLd(s: Dictionary, rawLocale: string) {
  const locale = (rawLocale === 'en' ? 'en' : 'tr') as Locale;
  const url = `${SITE.url}${localePath(locale, '/live-conditions')}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: s.liveStatus.jsonLdName,
        description: s.liveStatus.jsonLdDescription,
        inLanguage: LOCALE_CODE[locale],
        isPartOf: { '@id': `${SITE.url}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: s.header.home,
            item: `${SITE.url}${localePath(locale, '/')}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: s.liveStatus.jsonLdName,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function LiveConditionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const c = s.liveStatus;
  const waLink = SITE.whatsapp
    ? wa(
        SITE.whatsapp,
        c.whatsappMessage
      )
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(s, locale)) }}
      />

      <div className="container py-8 sm:py-12">
        {/* Main module (full mode: hourly, sun and details included) */}
        <section aria-label={s.common.weather} className="mx-auto max-w-5xl">
          <LocationWeatherModule
            lat={LOCATION.lat}
            lng={LOCATION.lng}
            tamMod
          />
        </section>

        <section
          aria-label={c.ctaTitle}
          className="mx-auto mt-14 max-w-5xl rounded-xl bg-navy-900 p-6 text-center text-white sm:p-10"
        >
          <h2 className="font-display text-xl font-bold sm:text-2xl">
            {c.ctaTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-navy-200">
            {c.ctaText}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/booking"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand-400 px-6 text-sm font-semibold text-navy-950 shadow-soft transition-colors duration-200 ease-smooth hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
            >
              {c.ctaBooking}
            </Link>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors duration-200 ease-smooth hover:border-white/50 hover:bg-white/10"
              >
                {c.ctaWhatsapp}
              </a>
            ) : null}
          </div>
          <p className="mt-4 text-xs text-navy-300">
            {c.sourceNote}
          </p>
        </section>
      </div>
    </>
  );
}
