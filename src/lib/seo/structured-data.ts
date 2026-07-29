/**
 * JSON-LD (schema.org) structured-data builders.
 *
 * Every function returns a plain JavaScript object, ready to embed in a Next.js
 * page with
 * `<script type="application/ld+json" dangerouslySetInnerHTML ... />`.
 *
 * Reference: https://schema.org (LocalBusiness, TouristAttraction, Service,
 * FAQPage, BreadcrumbList, Organization)
 */

import { SITE, LOCATION } from '@/lib/site';
import { dictionary } from '@/lib/i18n/dictionary';
import { LOCALE_CODE, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
import { FALLBACK_IMAGE } from '@/lib/images';

/** Shared "@context" value for the JSON-LD graph types. */
const CONTEXT = 'https://schema.org';

/**
 * @param path Route path (e.g. "/tandem-flight"). Returns an absolute URL.
 * @param base Base URL (defaults to SITE.url).
 */
export function absoluteUrl(path = '/', base: string = SITE.url): string {
  const root = base.replace(/\/$/, '');
  const tail = path.startsWith('/') ? path : `/${path}`;
  return `${root}${tail}`;
}

/**
 * Organization (business/brand) structured data.
 * Suitable for every page.
 */
export function organizationJsonLd() {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': `${absoluteUrl()}#organization`,
    name: SITE.name,
    url: absoluteUrl(),
    logo: absoluteUrl('/icon.png'),
    email: SITE.email,
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.youtube,
    ].filter(Boolean) as string[],
  };
}

/**
 * LocalBusiness structured data.
 * Fits location-bound services; carries the map and the opening hours.
 */
export function localBusinessJsonLd(locale: Locale = DEFAULT_LOCALE) {
  const s = dictionary(locale);
  return {
    '@context': CONTEXT,
    '@type': 'SportsActivityLocation',
    '@id': `${absoluteUrl()}#localbusiness`,
    name: SITE.name,
    description: s.common.siteDescription,
    url: absoluteUrl(),
    image: FALLBACK_IMAGE.hero,
    telephone: SITE.phone ?? undefined,
    email: SITE.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: LOCATION.addressLine,
      addressLocality: 'Ula',
      addressRegion: 'Muğla',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: LOCATION.lat,
      longitude: LOCATION.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    areaServed: {
      '@type': 'Place',
      name: s.common.serviceArea,
    },
    sameAs: [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.youtube,
    ].filter(Boolean) as string[],
  };
}

/**
 * TouristAttraction — for the take-off site page.
 * Emphasises the location and the experience.
 */
export function touristAttractionJsonLd(locale: Locale = DEFAULT_LOCALE) {
  const s = dictionary(locale);
  return {
    '@context': CONTEXT,
    '@type': 'TouristAttraction',
    '@id': absoluteUrl(
      '/take-off-site/gokova-oren-alatepe-paragliding'
    ),
    name: s.flightSite.metaTitle,
    description: s.flightSite.ogDescription,
    image: FALLBACK_IMAGE.takeoff,
    url: absoluteUrl('/take-off-site/gokova-oren-alatepe-paragliding'),
    touristType: s.flightSite.touristType,
    isAccessibleForFree: false,
    publicAccess: true,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: LOCATION.lat,
      longitude: LOCATION.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ula',
      addressRegion: 'Muğla',
      addressCountry: 'TR',
    },
  };
}

/**
 * Service — for the tandem flight and the packages.
 * @param name        Service name
 * @param description Service description
 * @param path        Page path for the service
 */
export function serviceJsonLd({
  name,
  description,
  path,
  locale = DEFAULT_LOCALE,
}: {
  name: string;
  description: string;
  path: string;
  locale?: Locale;
}) {
  const s = dictionary(locale);
  return {
    '@context': CONTEXT,
    '@type': 'Service',
    '@id': absoluteUrl(path),
    name,
    description,
    url: absoluteUrl(path),
    provider: {
      '@type': 'SportsActivityLocation',
      name: SITE.name,
      url: absoluteUrl(),
    },
    areaServed: {
      '@type': 'Place',
      name: s.common.serviceArea,
    },
  };
}

/**
 * FAQPage — for the FAQ page.
 * @param questions List of question/answer pairs
 */
export function faqPageJsonLd(
  questions: { question: string; answer: string }[]
) {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * BreadcrumbList — page hierarchy (matching the on-page breadcrumbs).
 * @param items Steps: an array of { name, path }
 */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * WebSite graph object (site-wide search and identity).
 */
export function websiteJsonLd(locale: Locale = DEFAULT_LOCALE) {
  const s = dictionary(locale);
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': `${absoluteUrl()}#website`,
    url: absoluteUrl(),
    name: SITE.name,
    description: s.common.siteDescription,
    inLanguage: LOCALE_CODE[locale],
    publisher: { '@id': `${absoluteUrl()}#organization` },
  };
}
