import { notFound } from 'next/navigation';
import { LOCALES, isValidLocale } from '@/lib/i18n/locales';

/**
 * Locale segment layout.
 *
 * The root layout (`src/app/layout.tsx`) sets up html/body and the providers;
 * all this does is confirm the segment is a valid locale. An invalid segment
 * (`/xyz/...`) yields a 404.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  return <>{children}</>;
}
