import type { Metadata } from 'next';
import { JsonLd } from '@/components/site/JsonLd';
import { LegalContent } from '@/components/site/LegalContent';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { managedPageContent, managedDictionary } from '@/lib/page-content';
import type { LegalContent as LegalContentData } from '@/lib/admin/page-content';
import { localeAlternates } from '@/lib/i18n/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = await managedPageContent<LegalContentData>(
    locale,
    'privacyPolicy'
  );
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: localeAlternates('/privacy-policy', locale),
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: '/privacy-policy',
      type: 'article',
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const content = await managedPageContent<LegalContentData>(
    locale,
    'privacyPolicy'
  );
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: content.title, path: '/privacy-policy' },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs)]} />
      <LegalContent items={breadcrumbs} content={content} />
    </>
  );
}
