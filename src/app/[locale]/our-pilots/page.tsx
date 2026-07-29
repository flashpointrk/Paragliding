import type { Metadata } from 'next';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

// Content is pulled from the database (Pilot), so this renders on the
// server for every request rather than being prerendered statically.
export const dynamic = 'force-dynamic';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { localeAlternates } from '@/lib/i18n/seo';
import { localizedText } from '@/lib/i18n/content';
import type { Pilot } from '@prisma/client';
import { FALLBACK_IMAGE } from '@/lib/images';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.pilots.metaTitle,
    description: s.pilots.metaDescription,
    alternates: localeAlternates('/our-pilots', locale),
    openGraph: {
      title: s.pilots.metaTitle,
      description: s.pilots.ogDescription,
      url: '/our-pilots',
      type: 'website',
    },
  };
}

async function getPilots(): Promise<Pilot[]> {
  try {
    return await prisma.pilot.findMany({
      where: { active: true },
      orderBy: [{ experienceYears: 'desc' }, { name: 'asc' }],
    });
  } catch {
    return [];
  }
}

export default async function PilotsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const pl = s.pilots;
  const pilots = await getPilots();
  const managedImages = await pageImages(locale, 'pilots');
  const heroImage = pickImage(managedImages, 'hero', FALLBACK_IMAGE.pilotsHero) ?? FALLBACK_IMAGE.pilotsHero;
  const ctaImage = pickImage(managedImages, 'cta', heroImage) ?? heroImage;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: pl.title, path: '/our-pilots' },
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

        <div className="container relative z-10 flex min-h-[40vh] flex-col justify-center py-20 text-white">
          <Reveal>
            <div className="max-w-3xl">
              <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
                {pl.eyebrow}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {pl.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand-100 sm:text-lg">
                {pl.introText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PILOT CARDS — plain, flat surfaces */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container">
          {pilots.length > 0 ? (
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {pilots.map((p) => (
                <Card
                  key={p.id}
                  interactive
                  className="flex h-full flex-col overflow-hidden rounded-2xl"
                >
                  {p.photoUrl ? (
                    <div className="relative aspect-[4/3] bg-navy-100">
                      <Image
                        src={p.photoUrl}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-navy-900">
                      <span className="font-display text-5xl font-bold text-white/90">
                        {p.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex flex-col gap-2">
                      <h2 className="font-display text-lg font-semibold text-navy-900">
                        {p.name}
                      </h2>
                      {p.specialty ? (
                        <Badge variant="blue" className="self-start">
                          {localizedText(locale, p.specialty, p.specialtyTr)}
                        </Badge>
                      ) : null}
                    </div>

                    <dl className="space-y-2.5 text-sm text-navy-700">
                      <div className="flex items-center gap-2.5">
                        <Icon name="Award" className="h-4 w-4 flex-none text-sky-600" aria-hidden="true" />
                        <dt className="text-navy-500">{pl.experience}</dt>
                        <dd className="ml-auto font-medium text-navy-900">
                          {p.experienceYears}+ {pl.year}
                        </dd>
                      </div>
                      {p.licence ? (
                        <div className="flex items-center gap-2.5">
                          <Icon
                            name="BadgeCheck"
                            className="h-4 w-4 flex-none text-sky-600"
                            aria-hidden="true"
                          />
                          <dt className="text-navy-500">{pl.licence}</dt>
                          <dd className="ml-auto text-right text-navy-800">
                            {localizedText(locale, p.licence, p.licenceTr)}
                          </dd>
                        </div>
                      ) : null}
                      {p.languages.length > 0 ? (
                        <div className="flex items-center gap-2.5">
                          <Icon
                            name="Languages"
                            className="h-4 w-4 flex-none text-sky-600"
                            aria-hidden="true"
                          />
                          <dt className="text-navy-500">{pl.languages}</dt>
                          <dd className="ml-auto text-right text-navy-800">
                            {p.languages.join(', ')}
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    {p.bio ? (
                      <p className="mt-auto text-sm leading-relaxed text-navy-600">
                        {localizedText(locale, p.bio, p.bioTr)}
                      </p>
                    ) : null}
                  </div>
                </Card>
              ))}
            </RevealGroup>
          ) : (
            <Reveal>
              <EmptyState
                icon="Users"
                title={pl.listPreparingTitle}
                description={pl.listPreparingText}
              />
            </Reveal>
          )}

          {/* Introduction text */}
          <Reveal delay={0.1}>
            <p className="mx-auto mt-12 max-w-2xl rounded-2xl border border-sand-200 bg-white p-6 text-center text-sm italic leading-relaxed text-navy-600 shadow-soft">
              {pl.approachQuote}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={pl.ctaTitle}
        description={pl.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: s.common.submitBooking,
          href: '/booking',
          icon: 'ArrowRight',
        }}
        secondaryAction={{
          label: s.header.contact,
          href: '/contact',
        }}
      />
    </>
  );
}
