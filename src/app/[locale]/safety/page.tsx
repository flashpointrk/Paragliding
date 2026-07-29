import type { Metadata } from 'next';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { SectionHeading } from '@/components/site/SectionHeading';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { localeAlternates } from '@/lib/i18n/seo';
import { FALLBACK_IMAGE } from '@/lib/images';

// Gallery images updated from the panel appear on the page immediately.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.safety.metaTitle,
    description: s.safety.metaDescription,
    alternates: localeAlternates('/safety', locale),
    openGraph: {
      title: s.safety.metaTitle,
      description: s.safety.ogDescription,
      url: '/safety',
      type: 'article',
    },
  };
}

const SECTION_ICONS: IconName[] = [
  'ShieldCheck',
  'Cloud',
  'Eye',
  'CloudRain',
  'HeartPulse',
  'FileCheck',
];

const SAFETY_IMAGE_FALLBACK = FALLBACK_IMAGE.safetyHero;

async function getSafetyGalleryImages() {
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

export default async function SafetyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const g = s.safety;
  const galleryImages = await getSafetyGalleryImages();
  const managedImages = await pageImages(locale, 'safety');
  const heroImage = pickImage(
    managedImages,
    'hero',
    galleryImages[0]?.url ?? SAFETY_IMAGE_FALLBACK
  ) ?? SAFETY_IMAGE_FALLBACK;
  const ctaImage = pickImage(
    managedImages,
    'cta',
    galleryImages[1]?.url ?? heroImage
  ) ?? heroImage;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: g.metaTitle, path: '/safety' },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs)]} />

      {/* HERO — photograph plus a calm scrim */}
      <section className="relative overflow-hidden bg-navy-950">
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
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/40 to-transparent" />
        </div>

        <div className="container relative z-10 flex min-h-[55vh] flex-col justify-center py-20 text-white">
          <Reveal>
            <div className="max-w-3xl">
              <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                {g.eyebrow}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {g.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand-100 sm:text-lg">
                {g.introText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SIX SECTION CARDS — plain, flat surfaces */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            title={g.sectionTitle}
            description={g.sectionDescription}
          />
          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {SECTION_ICONS.map((icon, i) => {
              const b = g.sections[i];
              if (!b) return null;
              return (
              <Card key={b.title} className="flex h-full flex-col gap-4 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon name={icon} className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="font-display text-lg font-semibold text-navy-900">
                  {b.title}
                </h2>
                <p className="text-sm leading-relaxed text-navy-600">{b.text}</p>
              </Card>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={g.ctaTitle}
        description={g.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: s.common.writeToUs,
          href: '/contact',
          icon: 'Mail',
        }}
        secondaryAction={{
          label: g.ctaSecondary,
          href: '/faq',
        }}
      />
    </>
  );
}
