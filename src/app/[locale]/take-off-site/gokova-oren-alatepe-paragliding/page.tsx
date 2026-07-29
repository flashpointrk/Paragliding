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
import { LocationWeatherModule } from '@/components/weather/LocationWeatherModule';
import {
  breadcrumbJsonLd,
  touristAttractionJsonLd,
  localBusinessJsonLd,
} from '@/lib/seo/structured-data';
import { LOCATION } from '@/lib/site';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import type { Locale } from '@/lib/i18n/locales';
import { localeAlternates } from '@/lib/i18n/seo';
import { FALLBACK_IMAGE } from '@/lib/images';

// Gallery images updated from the panel appear on the page immediately.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const s = await managedDictionary(rawLocale);
  return {
    title: s.flightSite.metaTitle,
    description: s.flightSite.metaDescription,
    alternates: localeAlternates(
      '/take-off-site/gokova-oren-alatepe-paragliding',
      rawLocale
    ),
    openGraph: {
      title: s.flightSite.metaTitle,
      description: s.flightSite.ogDescription,
      url: '/take-off-site/gokova-oren-alatepe-paragliding',
      type: 'article',
    },
  };
}



const GALLERY_IMAGE_FALLBACK = [
  FALLBACK_IMAGE.takeoff,
  FALLBACK_IMAGE.inflight,
  FALLBACK_IMAGE.experience,
  FALLBACK_IMAGE.coast,
];

async function getTakeOffSiteGalleryImages() {
  try {
    return await prisma.galleryMedia.findMany({
      where: { active: true, type: 'image' },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      take: 6,
      select: { url: true },
    });
  } catch {
    return [];
  }
}

function galleryImage(
  images: ReadonlyArray<{ url: string }>,
  index: number,
  fallback: string
) {
  return images.length > 0 ? images[index % images.length]?.url ?? fallback : fallback;
}

export default async function TakeOffSitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const s = await managedDictionary(rawLocale);
  const u = s.flightSite;
  const locale: Locale = rawLocale === 'en' ? 'en' : 'tr';
  const galleryImages = await getTakeOffSiteGalleryImages();
  const managedImages = await pageImages(locale, 'flightSite');
  const heroImage = pickImage(
    managedImages,
    'hero',
    galleryImage(
      galleryImages,
      0,
      GALLERY_IMAGE_FALLBACK[1] ?? FALLBACK_IMAGE.inflight
    )
  ) ?? (GALLERY_IMAGE_FALLBACK[1] ?? FALLBACK_IMAGE.inflight);
  const tileImages = GALLERY_IMAGE_FALLBACK.map((fallback, index) =>
    pickImage(
      managedImages,
      `kare${index + 1}`,
      galleryImage(galleryImages, index + 1, fallback)
    ) ?? fallback
  );
  const ctaImage = pickImage(
    managedImages,
    'cta',
    galleryImage(galleryImages, 5, heroImage)
  ) ?? heroImage;
  const SEASON_ICONS: IconName[] = ['Calendar', 'Clock', 'Car'];
  const SEASON_INFO = u.seasonInfo.map((b: { title: string; text: string }, i: number) => ({
    ...b,
    icon: SEASON_ICONS[i] as IconName,
  }));
  const NEARBY_PLACES = u.nearbyPlaces;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    {
      name: u.eyebrow,
      path: '/take-off-site/gokova-oren-alatepe-paragliding',
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          touristAttractionJsonLd(locale),
          localBusinessJsonLd(locale),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />

      {/* HERO — photograph plus the coordinate label */}
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
                {u.eyebrow} · {LOCATION.region}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-5xl">
                {u.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand-100 sm:text-lg">
                {u.introText}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-navy-950/50 px-4 py-2 text-sm font-medium text-white">
                  <Icon name="Navigation" className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  {LOCATION.lat}, {LOCATION.lng}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TAKE-OFF / LANDING — two plain cards */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <RevealGroup className="grid gap-6 lg:grid-cols-2" stagger={0.1}>
            <Card className="flex h-full flex-col gap-4 p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon name="Mountain" className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl font-semibold text-navy-900">
                  {u.takeoffTitle}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-navy-600">
                {u.takeoffText}
              </p>
              <dl className="space-y-1.5 text-sm text-navy-700">
                <div className="flex flex-wrap gap-1">
                  <dt className="font-medium">{u.location}</dt>
                  <dd>Alatepe, {LOCATION.region}</dd>
                </div>
                <div className="flex flex-wrap gap-1">
                  <dt className="font-medium">{u.coordinate}</dt>
                  <dd>
                    {LOCATION.lat}, {LOCATION.lng}
                  </dd>
                </div>
              </dl>
              <p className="mt-auto text-xs text-navy-400">
                {u.coordinateNote}
              </p>
            </Card>

            <Card className="flex h-full flex-col gap-4 p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon name="MapPin" className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl font-semibold text-navy-900">
                  {u.landingTitle}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-navy-600">
                {u.landingText}
              </p>
            </Card>
          </RevealGroup>
        </div>
      </section>

      {/* SEASON / HOURS / ACCESS — a three-up plain grid */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container">
          <RevealGroup className="grid gap-6 md:grid-cols-3" stagger={0.1}>
            {SEASON_INFO.map((info) => (
              <Card key={info.title} className="flex h-full flex-col gap-3 p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Icon name={info.icon} className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-navy-900">
                    {info.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-navy-600">{info.text}</p>
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* WEATHER MODULE */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <Reveal className="mx-auto max-w-3xl">
            <SectionHeading
              title={u.weatherTitle}
              description={u.weatherDescription}
            />
            <div className="mt-10">
              <LocationWeatherModule lat={LOCATION.lat} lng={LOCATION.lng} tamMod />
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY, FOUR UP */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            title={u.tileTitle}
            description={u.tileDescription}
          />
          <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {tileImages.map((src, i) => (
              <figure
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft"
              >
                <Image
                  src={src}
                  alt={u.tileAlt[i] ?? u.tileTitle}
                  fill
                  unoptimized={src.startsWith('/uploads/')}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </figure>
            ))}
          </RevealGroup>
          <p className="mt-6 text-center text-xs text-navy-400">
            {u.tileNote}
          </p>
        </div>
      </section>

      {/* POINTS OF INTEREST */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            title={u.nearbyTitle}
            description={u.nearbyDescription}
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {NEARBY_PLACES.map((t: { title: string; text: string }) => (
              <Card key={t.title} interactive className="flex h-full flex-col gap-2 p-6">
                <h3 className="font-display text-base font-semibold text-navy-900">
                  {t.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-600">{t.text}</p>
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={u.ctaTitle}
        description={u.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: s.common.submitBooking,
          href: '/booking',
          icon: 'ArrowRight',
        }}
        secondaryAction={{
          label: u.ctaSecondary,
          href: '/contact',
        }}
      />
    </>
  );
}
