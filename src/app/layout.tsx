import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { SITE } from '@/lib/site';
import { AppShell } from '@/components/site/AppShell';
import { LOCALE_CODE, DEFAULT_LOCALE, isValidLocale, type Locale } from '@/lib/i18n/locales';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { FALLBACK_IMAGE } from '@/lib/images';

/** Reads the active locale from the `x-locale` header set by the middleware. */
async function activeLocale(): Promise<Locale> {
  const titles = await headers();
  const ham = titles.get('x-locale') ?? DEFAULT_LOCALE;
  return isValidLocale(ham) ? ham : DEFAULT_LOCALE;
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Display font — for headings (Sora). A variable font, 100-800.
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

/**
 * Root metadata is produced per locale. Sitting above the `[locale]` segment,
 * this layout reads the locale from the `x-locale` header the middleware adds.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await activeLocale();
  const s = await managedDictionary(locale);
  const sharedImages = await pageImages(locale, 'common');
  const ogImage = pickImage(sharedImages, 'ogGorsel', FALLBACK_IMAGE.hero) ?? FALLBACK_IMAGE.hero;
  const o = s.common;

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: o.siteTitle,
      template: `%s | ${o.brandName}`,
    },
    description: o.siteDescription,
    applicationName: o.brandName,
    keywords: [...o.keywords],
    authors: [{ name: o.brandName }],
    creator: o.brandName,
    publisher: o.brandName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: LOCALE_CODE[locale].replace('-', '_'),
      url: SITE.url,
      siteName: o.brandName,
      title: o.siteTitle,
      description: o.siteDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: o.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: o.siteTitle,
      description: o.siteDescription,
      images: [ogImage],
    },
    category: 'sports',
  };
}

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The locale comes from the `x-locale` header set by the middleware: the root
  // layout sits above the `[locale]` segment and so cannot reach params.
  const locale = await activeLocale();

  return (
    <html lang={LOCALE_CODE[locale]} className={`${inter.variable} ${sora.variable}`}>
      <body className={inter.className}>
        <MotionProvider>
          <AppShell>{children}</AppShell>
        </MotionProvider>
      </body>
    </html>
  );
}
