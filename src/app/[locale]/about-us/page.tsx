import type { Metadata } from 'next';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { Icon, type IconName } from '@/components/ui/Icon';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { localeAlternates } from '@/lib/i18n/seo';
import { FALLBACK_IMAGE } from '@/lib/images';

// Keeps the page current as the gallery images uploaded from the panel change.
export const dynamic = 'force-dynamic';

const ABOUT_IMAGE_FALLBACK = FALLBACK_IMAGE.aboutHero;

async function getAboutGalleryImages() {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const description = `${SITE.name} — ${s.about.introText}`;
  return {
    title: s.about.metaTitle,
    description: description,
    alternates: localeAlternates('/about-us', locale),
    openGraph: {
      title: s.about.metaTitle,
      description: description,
      url: '/about-us',
      type: 'article',
    },
  };
}


export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const h = s.about;
  const galleryImages = await getAboutGalleryImages();
  const managedImages = await pageImages(locale, 'about');
  const heroImage = pickImage(
    managedImages,
    'hero',
    galleryImages[0]?.url ?? ABOUT_IMAGE_FALLBACK
  ) ?? ABOUT_IMAGE_FALLBACK;
  const portraitImage = pickImage(managedImages, 'portre', FALLBACK_IMAGE.tandem) ?? FALLBACK_IMAGE.tandem;
  const ctaImage = pickImage(
    managedImages,
    'cta',
    galleryImages[1]?.url ?? heroImage
  ) ?? heroImage;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: h.title, path: '/about-us' },
  ];

  const otherSections: { title: string; text: string; icon: IconName }[] = [
    {
      title: `${SITE.operator} ${s.footer.backedBy}`,
      icon: 'BadgeCheck',
      text: `${SITE.name} — ${SITE.operator}.`,
    },
    { title: h.localSectionTitle, text: h.localSectionText, icon: 'Mountain' },
    { title: h.teamSectionTitle, text: h.teamSectionText, icon: 'ShieldCheck' },
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

        <div className="container relative z-10 flex min-h-[45vh] flex-col justify-center py-20 text-white">
          <Reveal>
            <div className="max-w-3xl">
              <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                {h.eyebrow}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-5xl">
                {h.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand-100 sm:text-lg">
                {h.introText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* THE STORY — a large photo beside the text */}
      <section className="py-20 sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-sand-200 shadow-soft-lg sm:aspect-square">
              <Image
                src={portraitImage}
                alt={h.pilotImageAlt}
                fill
                loading="lazy"
                unoptimized={portraitImage.startsWith('/uploads/')}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              {h.storyEyebrow}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {h.storyTitle}
            </h2>
            <div className="mt-5 max-w-xl space-y-4 text-base leading-relaxed text-navy-700">
              <p>{h.storyP1}</p>
              <p>{h.storyP2}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FURTHER SECTIONS — plain prose blocks with hairline separators */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container max-w-2xl">
          <RevealGroup className="space-y-14" stagger={0.1}>
            {otherSections.map((b) => (
              <div key={b.title} className="border-t border-sand-200 pt-10 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white text-sky-600 shadow-soft">
                    <Icon name={b.icon} className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-navy-900">
                    {b.title}
                  </h2>
                </div>
                <p className="mt-4 text-base leading-relaxed text-navy-700">{b.text}</p>
              </div>
            ))}

            {/* The milestones placeholder was removed. */}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={h.ctaTitle}
        description={h.ctaDescription}
        primaryAction={{
          label: h.ctaPrimary,
          href: '/contact',
          icon: 'Mail',
        }}
        backgroundImage={ctaImage}
      />
    </>
  );
}
