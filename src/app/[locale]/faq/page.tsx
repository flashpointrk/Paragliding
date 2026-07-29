import type { Metadata } from 'next';
import Image from 'next/image';
import { LocaleLink as Link } from '@/components/site/LocaleLink';
import { prisma } from '@/lib/prisma';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { FaqAccordion } from '@/components/site/FaqAccordion';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo/structured-data';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { localeAlternates } from '@/lib/i18n/seo';
import { localizedText } from '@/lib/i18n/content';

// The copy comes from the database (Faq), so the page renders per request.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.faq.metaTitle,
    description: s.faq.metaDescription,
    alternates: localeAlternates('/faq', locale),
    openGraph: {
      title: s.faq.metaTitle,
      description: s.faq.ogDescription,
      url: '/faq',
      type: 'website',
    },
  };
}

async function getFaq() {
  try {
    return await prisma.faq.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch {
    return [];
  }
}

async function getFaqGalleryImages() {
  try {
    return await prisma.galleryMedia.findMany({
      where: { active: true, type: 'image' },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      take: 2,
      select: { url: true },
    });
  } catch {
    return [];
  }
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const f = s.faq;
  const faq = await getFaq();
  const galleryImages = await getFaqGalleryImages();
  const managedImages = await pageImages(locale, 'faq');
  const heroImage = pickImage(managedImages, 'hero', galleryImages[0]?.url);
  const ctaImage =
    pickImage(managedImages, 'cta', galleryImages[1]?.url ?? heroImage) ??
    undefined;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: f.metaTitle, path: '/faq' },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          ...(faq.length > 0
            ? [
                faqPageJsonLd(
                  faq.map((q) => ({
                    question: localizedText(locale, q.question, q.questionTr),
                    answer: localizedText(locale, q.answer, q.answerTr),
                  }))
                ),
              ]
            : []),
        ]}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950">
        {heroImage ? (
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              unoptimized={heroImage.startsWith('/uploads/')}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/55 to-navy-950/25" />
          </div>
        ) : null}
        <div className="container relative z-10 flex min-h-[36vh] flex-col justify-center py-20 text-white sm:py-28">
          <Reveal>
            <div className="max-w-3xl">
              <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
                {f.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {f.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                {f.introText}{' '}
                <Link
                  href="/contact"
                  className="font-semibold text-sky-300 underline-offset-4 hover:underline"
                >
                  {f.signInLink}
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SSS AKORDEON */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container max-w-3xl">
          {faq.length > 0 ? (
            <Reveal>
              <FaqAccordion
                items={faq.map((q) => ({
                  id: q.id,
                  question: localizedText(locale, q.question, q.questionTr),
                  answer: localizedText(locale, q.answer, q.answerTr),
                }))}
              />
            </Reveal>
          ) : (
            <Reveal>
              <EmptyState
                icon="MessageSquare"
                title={f.emptyTitle}
                description={f.emptyText}
                action={
                  <Link
                    href="/contact"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-navy-200 px-5 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                  >
                    {f.emptyAction}
                  </Link>
                }
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* FOOTNOTE */}
      <section className="bg-white py-12">
        <div className="container max-w-3xl">
          <Reveal>
            <Card className="flex items-center gap-4 p-6 text-center">
              <Icon
                name="Info"
                className="h-6 w-6 flex-none text-sky-600"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-navy-600">
                {f.footnote}
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={f.ctaTitle}
        description={f.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: f.ctaPrimary,
          href: '/contact',
          icon: 'Mail',
        }}
        secondaryAction={{
          label: s.common.submitBooking,
          href: '/booking',
        }}
      />
    </>
  );
}
