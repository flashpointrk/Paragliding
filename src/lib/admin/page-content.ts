import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { dictionary } from '@/lib/i18n/dictionary';
import { FALLBACK_IMAGE } from '@/lib/images';
import { trLegalContent } from '@/messages/tr';

export type PageContentSlug = keyof Dictionary;
export type CustomPageContentSlug =
  | 'privacyPolicy'
  | 'cookiePolicy'
  | 'termsOfSale';
export type AnyPageContentSlug = PageContentSlug | CustomPageContentSlug;

export type LegalContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdated: string;
  login: string;
  sections: { title: string; text: string }[];
};

export type ImageSlot = {
  key: string;
  label: string;
  fallback: string;
  description?: string;
};

export type PageContentDefinition = {
  slug: AnyPageContentSlug;
  label: string;
  description: string;
  images: ImageSlot[];
};

/**
 * Legal page copy, written in the default locale. Other locales keep their
 * translation next to the rest of their strings in `src/messages`, so this
 * module holds no localized text.
 */
const LEGAL_CONTENT: Record<Locale, Record<CustomPageContentSlug, LegalContent>> = {
  en: {
    privacyPolicy: {
      metaTitle: 'Privacy Policy',
      metaDescription:
        'What personal data we collect, why we process it, how long we keep it and your rights.',
      title: 'Privacy Policy',
      lastUpdated: '2026-07-24',
      login:
        'We take the privacy of our visitors and guests seriously. This policy explains how personal data collected through our website is processed.',
      sections: [
        { title: '1. Data we collect', text: 'Through our contact and booking forms we collect information such as your name, phone number, e-mail address and flight preferences. Technical data such as IP address, browser type and usage data may also be recorded.' },
        { title: '2. Why we process your data', text: 'The data is used to handle bookings, deliver the service, communicate with you, maintain security and meet legal obligations.' },
        { title: '3. Storage', text: 'Personal data is stored for as long as required by applicable legislation or by the purpose of processing. Once that period ends, it is securely deleted or anonymised.' },
        { title: '4. Sharing', text: 'Your data is not shared with third parties without explicit consent. Where necessary to deliver the service, only required information is passed on. Requests from public authorities are handled under applicable law.' },
        { title: '5. Your rights', text: 'You may have the right to access, correct, delete, object to processing and request portability of your data. Please contact us through our channels to exercise these rights.' },
        { title: '6. Cookies', text: 'Cookies may be used on this site. See the Cookie Policy for the types of cookies and why they are used.' },
        { title: '7. Contact', text: 'If you have questions about this policy, please contact us through our communication channels.' },
      ],
    },
    cookiePolicy: {
      metaTitle: 'Cookie Policy',
      metaDescription:
        'The types of cookies we use, why we use them and how to manage your preferences.',
      title: 'Cookie Policy',
      lastUpdated: '2026-07-24',
      login:
        'This cookie policy explains how cookies and similar technologies are used on this website.',
      sections: [
        { title: '1. What is a cookie?', text: 'Cookies are small text files stored in your browser when you visit our website. They help us run the site efficiently and improve your experience.' },
        { title: '2. Types of cookies we use', text: 'Strictly necessary cookies support basic functions. Performance and analytics cookies may help us understand visitor behaviour anonymously, and functional cookies may remember preferences.' },
        { title: '3. Third parties', text: 'Where third-party services such as maps, video or analytics are used, those services may set their own cookies. Each service has its own privacy policy.' },
        { title: '4. Managing your preferences', text: 'You can delete or block cookies through your browser settings. Consent management for non-essential cookies may be provided through a preference panel.' },
        { title: '5. Contact', text: 'If you have questions about this cookie policy, please contact us through our communication channels.' },
      ],
    },
    termsOfSale: {
      metaTitle: 'Terms of Sale and Cancellation',
      metaDescription:
        'Payment, cancellation, weather-related postponement and refunds for tandem flight bookings.',
      title: 'Terms of Sale and Cancellation',
      lastUpdated: '2026-07-24',
      login:
        'This page explains pre-contract information, payment, cancellation, postponement and refund terms for tandem paragliding bookings.',
      sections: [
        { title: '1. Pre-contract information', text: 'The service is a tandem flight experience subject to pilot approval, weather, operational availability and safety assessment.' },
        { title: '2. Payment', text: 'Payment and deposit terms may be shared during booking. Price and scope may vary by selected package and operational plan.' },
        { title: '3. Right of withdrawal', text: 'For leisure services provided on a specific date or period, withdrawal rights may be limited under applicable rules. Each request is reviewed individually.' },
        { title: '4. Cancellation', text: 'Guest cancellations are assessed by operation schedule, notice time and preparation costs. Business-side cancellations may be handled with rescheduling or eligible refund options.' },
        { title: '5. Postponement', text: 'Flights may be postponed due to weather, safety or pilot assessment. Flight approval is only given by operation/pilot evaluation.' },
        { title: '6. Refunds', text: 'Where a refund is required, it is processed within a reasonable period depending on the payment method and provider process.' },
        { title: '7. Changes', text: 'Operational conditions, prices and package scope may change. Current terms are shared before booking.' },
        { title: '8. Contact', text: 'For questions about sale and cancellation terms, please contact us through our communication channels.' },
      ],
    },
  },
  tr: trLegalContent,
};

export const PAGE_CONTENT_DEFINITIONS: PageContentDefinition[] = [
  {
    slug: 'common',
    label: 'General copy',
    description: 'Buttons, brand strings, site meta descriptions and shared interface wording.',
    images: [
      { key: 'ogImage', label: 'Default OG image', fallback: FALLBACK_IMAGE.hero },
    ],
  },
  {
    slug: 'header',
    label: 'Header',
    description: 'Main navigation, the explore menu and the locale switcher.',
    images: [],
  },
  {
    slug: 'footer',
    label: 'Footer',
    description: 'Footer description, column headings and legal links.',
    images: [],
  },
  {
    slug: 'home',
    label: 'Home page',
    description: 'Hero, why-us, process, package preview, gallery and CTA copy.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.hero },
      { key: 'whyUs1', label: 'Why us 1', fallback: FALLBACK_IMAGE.tandem },
      { key: 'whyUs2', label: 'Why us 2', fallback: FALLBACK_IMAGE.equipment },
      { key: 'whyUs3', label: 'Why us 3', fallback: FALLBACK_IMAGE.experience },
      { key: 'whyUs4', label: 'Why us 4', fallback: FALLBACK_IMAGE.coast },
      { key: 'process', label: 'Process image', fallback: FALLBACK_IMAGE.takeoff },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'about',
    label: 'About us',
    description: 'Company story, team and local information, hero and CTA slots.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.aboutHero },
      { key: 'portrait', label: 'Pilot portrait', fallback: FALLBACK_IMAGE.tandem },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'tandem',
    label: 'Tandem flight',
    description: 'Tandem flight introduction, what is included, the process and info boxes.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.tandemHero },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'flightSite',
    label: 'Take-off site',
    description: 'Copy and image slots for the Gökova Ören / Alatepe page.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.takeOffSiteHero },
      { key: 'tile1', label: 'Gallery tile 1', fallback: FALLBACK_IMAGE.takeoff },
      { key: 'tile2', label: 'Gallery tile 2', fallback: FALLBACK_IMAGE.inflight },
      { key: 'tile3', label: 'Gallery tile 3', fallback: FALLBACK_IMAGE.experience },
      { key: 'tile4', label: 'Gallery tile 4', fallback: FALLBACK_IMAGE.coast },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'safety',
    label: 'Safety',
    description: 'Safety procedures, equipment and CTA copy.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.safetyHero },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'packages',
    label: 'Packages and prices',
    description: 'Package page introduction, included services and notes.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.packagesHero },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'pilots',
    label: 'Our pilots',
    description: 'Pilot list page copy and its empty state.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.pilotsHero },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'gallery',
    label: 'Gallery page',
    description: 'Gallery headings, category labels, placeholders and CTA slots.',
    images: [
      { key: 'placeholder1', label: 'Placeholder 1', fallback: FALLBACK_IMAGE.takeoff },
      { key: 'placeholder2', label: 'Placeholder 2', fallback: FALLBACK_IMAGE.inflight },
      { key: 'placeholder3', label: 'Placeholder 3', fallback: FALLBACK_IMAGE.experience },
      { key: 'placeholder4', label: 'Placeholder 4', fallback: FALLBACK_IMAGE.landing },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'booking',
    label: 'Booking',
    description: 'Booking page headings, trust elements and the copy around the form.',
    images: [],
  },
  {
    slug: 'contact',
    label: 'Contact',
    description: 'Contact page copy and hero image.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.secondaryHero },
    ],
  },
  {
    slug: 'faq',
    label: 'FAQ',
    description: 'FAQ page headings, empty state and CTA copy.',
    images: [
      { key: 'hero', label: 'Hero image', fallback: FALLBACK_IMAGE.secondaryHero },
      { key: 'cta', label: 'CTA background', fallback: FALLBACK_IMAGE.cta },
    ],
  },
  {
    slug: 'liveStatus',
    label: 'Live conditions',
    description: 'Copy for the live weather and flight-suitability page.',
    images: [],
  },
  {
    slug: 'privacyPolicy',
    label: 'Privacy policy',
    description: 'Title, meta and body copy for the privacy page.',
    images: [],
  },
  {
    slug: 'cookiePolicy',
    label: 'Cookie policy',
    description: 'Title, meta and body copy for the cookie policy page.',
    images: [],
  },
  {
    slug: 'termsOfSale',
    label: 'Terms of sale',
    description: 'Distance selling, cancellation, postponement and refund terms.',
    images: [],
  },
];

export function pageContentDefinition(slug: string): PageContentDefinition | undefined {
  return PAGE_CONTENT_DEFINITIONS.find((definition) => definition.slug === slug);
}

export function isDictionarySlug(slug: string): slug is PageContentSlug {
  return slug in dictionary(DEFAULT_LOCALE);
}

export function defaultPageContent(slug: AnyPageContentSlug, locale: Locale) {
  if (!isDictionarySlug(slug)) {
    return LEGAL_CONTENT[locale][slug];
  }
  const s = dictionary(locale);
  return s[slug];
}

export function fallbackImages(definition: PageContentDefinition) {
  return Object.fromEntries(definition.images.map((image) => [image.key, image.fallback]));
}
