import type { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/site/LocaleLink';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

// This page pulls dynamic content (packages, FAQ) from the database, so it
// renders on the server for every request rather than being prerendered.
export const dynamic = 'force-dynamic';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/site/JsonLd';
import {
  localBusinessJsonLd,
  breadcrumbJsonLd,
} from '@/lib/seo/structured-data';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { LiveWeatherSummary } from '@/components/weather/LiveWeatherSummary';
import { SectionHeading } from '@/components/site/SectionHeading';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import type { Locale } from '@/lib/i18n/locales';
import { localeAlternates } from '@/lib/i18n/seo';
import { localizedText, localeList } from '@/lib/i18n/content';
import { FALLBACK_IMAGE } from '@/lib/images';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const s = await managedDictionary(rawLocale);
  return {
    title: s.home.metaTitle,
    description: s.home.metaDescription,
    alternates: localeAlternates('/', rawLocale),
    openGraph: {
      title: s.home.metaTitle,
      description: s.home.ogDescription,
      url: SITE.url,
      type: 'website',
    },
  };
}

async function getActivePackages() {
  try {
    return await prisma.package.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      take: 4,
    });
  } catch {
    return [];
  }
}

/** The home page gallery preview only uses active images uploaded from the panel. */
async function getActiveGalleryPreview() {
  try {
    return await prisma.galleryMedia.findMany({
      where: { active: true, type: 'image' },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      take: 4,
      select: {
        id: true,
        url: true,
        title: true,
        altText: true,
        titleTr: true,
        altTextTr: true,
        width: true,
        height: true,
      },
    });
  } catch {
    // With no home page gallery record yet, render no broken or hardcoded fallback.
    return [];
  }
}

const WHY_US_IMAGE: ReadonlyArray<{ icon: IconName; image: string }> = [
  { icon: 'Award', image: FALLBACK_IMAGE.tandem },
  { icon: 'ShieldCheck', image: FALLBACK_IMAGE.equipment },
  { icon: 'Camera', image: FALLBACK_IMAGE.experience },
  { icon: 'CalendarCheck', image: FALLBACK_IMAGE.coast },
];


const INCLUDED_SERVICE_ICONS: ReadonlyArray<IconName> = [
  'Car',
  'Coffee',
  'Camera',
  'Award',
];

const GALLERY_PREVIEW_LAYOUT: ReadonlyArray<string> = [
  'sm:col-span-2 sm:row-span-2',
  '',
  '',
  'sm:col-span-2',
];

const HOME_IMAGE_FALLBACK = FALLBACK_IMAGE.hero;

/** Fills the selected home page slots with the uploaded gallery images. */
function homeGalleryImage(images: readonly string[], index: number): string {
  if (images.length === 0) return HOME_IMAGE_FALLBACK;
  return images[index % images.length] ?? HOME_IMAGE_FALLBACK;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const s = await managedDictionary(rawLocale);
  const a = s.home;
  const locale: Locale = rawLocale === 'en' ? 'en' : 'tr';
  const packages = await getActivePackages();
  const galleryPreview = await getActiveGalleryPreview();
  const managedImages = await pageImages(locale, 'home');
  const homeGalleryImages = galleryPreview.map((media) => media.url);
  const heroImage = pickImage(managedImages, 'hero', HOME_IMAGE_FALLBACK) ?? HOME_IMAGE_FALLBACK;
  const processImage = pickImage(
    managedImages,
    'surec',
    homeGalleryImage(homeGalleryImages, 0)
  ) ?? HOME_IMAGE_FALLBACK;
  const ctaImage = pickImage(
    managedImages,
    'cta',
    homeGalleryImage(homeGalleryImages, 3)
  ) ?? HOME_IMAGE_FALLBACK;
  const whyUsImages = WHY_US_IMAGE.map((image, i) => ({
    ...image,
    image: pickImage(managedImages, `nedenBiz${i + 1}`, image.image) ?? image.image,
  }));

  const breadcrumbItems = [{ name: s.header.home, path: '/' }];

  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(locale),
          breadcrumbJsonLd(breadcrumbItems),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: a.whyUsTitle,
            itemListElement: a.whyUs.map((n, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: n.title,
              description: n.text,
            })),
          },
        ]}
      />

      {/* ============ HERO — photo first, calm ============ */}
      {/* Hero plus header fill the viewport: the header takes 5rem (h-20). */}
      <section className="relative flex min-h-[calc(100svh-5rem)] overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={a.heroImageAlt}
            fill
            priority
            unoptimized={heroImage.startsWith('/uploads/')}
            sizes="100vw"
            className="object-cover object-[64%_50%] sm:object-[center_38%]"
          />
          {/* Thin navy base — only under the left strip holding the text block;
              the legibility of the white type depends on it. It sits BELOW the
              cyan layer so the colour identity survives. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-navy-950/75 from-0% via-navy-950/40 via-28% to-transparent to-55%"
          />
          {/* Brand cyan gradient overlay (#00CBFF → #00F5FF).
              Left to right: dense at the left edge, fading rightwards and fully
              transparent by the middle of the image — the right half is
              untouched. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-hero-cyan/55 from-0% via-hero-aqua/25 via-25% to-transparent to-50%"
          />
        </div>

        {/* The text block is vertically centred; the live status card is pinned
              bottom-right. */}
        <div className="container relative z-10 flex justify-between gap-10 pb-16 pt-32 text-white">
          <Reveal className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-navy-950/50 px-4 py-1.5 text-sm font-medium text-sand-100">
                <Icon name="MapPin" className="h-4 w-4 text-sky-300" aria-hidden="true" />
                {a.heroLocation}
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
                {a.heroTitle}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-sand-100 sm:text-lg">
                {a.heroText}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/booking">
                  <Button variant="primary" size="lg" className="gap-2">
                    {s.common.submitBooking}
                    <Icon name="ArrowRight" className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>

                <Link
                  href="/live-conditions"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-base font-semibold text-white transition-colors duration-200 ease-smooth hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  <Icon name="Wind" className="h-5 w-5" aria-hidden="true" />
                  {s.common.liveStatus}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sand-200">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Shield" className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  {a.pilotBadge}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-sand-300/60 sm:inline-block" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Award" className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  {a.equipmentBadge}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-sand-300/60 sm:inline-block" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Wind" className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  {a.experienceBadge}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Live status — the hero's bottom-right corner.
              Hidden on mobile: there is no room, and the data has its own page. */}
          {/* Width follows the content, so no dead space is left on the right. */}
          <Reveal
            delay={0.25}
            className="hidden w-auto max-w-[15rem] shrink-0 self-end lg:block"
          >
            <LiveWeatherSummary compact />
          </Reveal>
        </div>
      </section>

      {/* ============ WHAT'S INCLUDED — a short highlights band ============ */}
      <section className="border-b border-sand-200 bg-sand-50 py-14">
        <div className="container">
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {INCLUDED_SERVICE_ICONS.map((icon, i) => {
              const h = a.includedServices[i];
              if (!h) return null;
              return (
              <Card key={h.title} className="flex items-start gap-3 p-5">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-sky-50 text-sky-600"
                >
                  <Icon name={icon} className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight text-navy-900">
                    {h.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-navy-500">{h.text}</p>
                </div>
              </Card>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* ============ WHY FLY WITH US ============ */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            eyebrow={a.whyUsEyebrow}
            title={a.whyUsTitle}
            description={a.whyUsDescription}
          />

          <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {whyUsImages.map((g, i) => {
              const n = a.whyUs[i];
              if (!n) return null;
              return (
              <article
                key={n.title}
                className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl bg-navy-900 p-6 shadow-soft transition-[transform,box-shadow] duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <Image
                  src={g.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
                />
                {/* Scrim for text legibility */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/20"
                />

                <div className="relative flex flex-col gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm"
                  >
                    <Icon name={g.icon} className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-white">
                    {n.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-sand-100">{n.text}</p>
                </div>
              </article>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* ============ THE FLIGHT EXPERIENCE — photo plus a plain step list ============ */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-sand-200 shadow-soft-lg sm:aspect-square">
              <Image
                src={processImage}
                alt={a.galleryDescription}
                fill
                loading="lazy"
                unoptimized={processImage.startsWith('/uploads/')}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow={a.processEyebrow}
              title={a.processTitle}
              description={a.processDescription}
              align="left"
            />

            <RevealGroup className="relative mt-10 flex flex-col gap-8" stagger={0.08}>
              {a.experienceFlow.map((step, i) => (
                <Reveal key={step.title} className="relative flex gap-4 pl-0">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-500 font-display text-sm font-bold text-brand-700">
                      {i + 1}
                    </span>
                    {i < a.experienceFlow.length - 1 ? (
                      <span aria-hidden="true" className="mt-1 w-px flex-1 bg-sand-200" />
                    ) : null}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-display text-base font-bold tracking-tight text-navy-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ============ PACKAGE PREVIEW ============ */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              title={a.packagesTitle}
              description={a.packagesDescription}
              align="left"
            />
            <Link
              href="/packages-and-prices"
              className="group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-navy-200 bg-white px-5 text-sm font-semibold text-navy-800 transition-colors duration-200 ease-smooth hover:border-sky-300 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              {s.common.seeAllPackages}
              <Icon name="ArrowRight" className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <RevealGroup
            className={`mt-12 grid gap-6 sm:grid-cols-2 ${
              packages.length >= 3 ? 'lg:grid-cols-3' : ''
            }`}
            stagger={0.1}
          >
            {packages.length > 0 ? (
              packages.map((p, i) => (
                <Link
                  key={p.id}
                  href="/packages-and-prices"
                  className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl shadow-soft transition-shadow duration-300 ease-smooth hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                >
                  <Image
                    src={homeGalleryImage(homeGalleryImages, i + 1)}
                    alt=""
                    fill
                    unoptimized={homeGalleryImage(homeGalleryImages, i + 1).startsWith('/uploads/')}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
                  />
                  {/* Bottom-up dim for text legibility */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/45 to-transparent"
                  />

                  <div className="relative flex flex-col gap-2.5 p-6 text-white">
                    <h3 className="font-display text-2xl font-bold tracking-tight">
                      {localizedText(locale, p.name, p.nameTr)}
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-sand-100">
                      {localizedText(locale, p.description, p.descriptionTr)}
                    </p>
                    {p.content.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5 pt-1">
                        {localeList(locale, p.content, p.contentTr).slice(0, 3).map((item) => (
                          <li
                            key={item}
                            className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300">
                      {s.common.seeDetails}
                      <Icon
                        name="ArrowRight"
                        className="h-4 w-4 transition-transform duration-200 ease-smooth group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <Reveal className="col-span-full">
                <Card className="p-10 text-center text-sm text-navy-500">
                  {a.packagesComingSoon}
                </Card>
              </Reveal>
            )}
          </RevealGroup>

          <Reveal delay={0.2}>
            <p className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-sand-50 px-4 py-2 text-xs text-navy-600">
              <Icon name="Info" className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
              {a.priceNote}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ GALLERY PREVIEW — an editorial asymmetric grid ============ */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              title={a.galleryTitle}
              description={a.galleryDescription}
              align="left"
            />
            <Link
              href="/gallery"
              className="group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-navy-200 bg-white px-5 text-sm font-semibold text-navy-800 transition-colors duration-200 ease-smooth hover:border-sky-300 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              {s.common.browseGallery}
              <Icon name="ArrowRight" className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {galleryPreview.length > 0 ? (
            <RevealGroup
              className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              stagger={0.1}
            >
              {galleryPreview.map((media, i) => {
                const fallback = a.galleryTiles[i];
                const alt =
                  localizedText(locale, media.altText ?? media.title ?? '', media.altTextTr ?? media.titleTr) ||
                  fallback?.alt ||
                  a.galleryDescription;
                const title = localizedText(locale, media.title ?? '', media.titleTr);

                return (
                  <Reveal
                    key={media.id}
                    className={GALLERY_PREVIEW_LAYOUT[i] ?? ''}
                  >
                    <figure className="relative h-full w-full overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft">
                      <Image
                        src={media.url}
                        alt={alt}
                        fill
                        loading="lazy"
                        unoptimized={media.url.startsWith('/uploads/')}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                      {title ? (
                        <figcaption className="absolute inset-x-0 bottom-0 flex items-center bg-navy-950/60 px-4 py-2.5 text-sm font-semibold text-white">
                          {title}
                        </figcaption>
                      ) : null}
                    </figure>
                  </Reveal>
                );
              })}
            </RevealGroup>
          ) : null}
        </div>
      </section>

      {/* The guest impressions section is removed until the Google/Tripadvisor
          integration lands. */}

      {/* The FAQ preview is removed: the same questions live in full on the
          Discover › FAQ page (/faq). */}

      {/* ============ CTA SECTION ============ */}
      <CtaSection
        title={a.ctaTitle}
        description={a.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: s.common.submitBooking,
          href: '/booking',
          icon: 'ArrowRight',
        }}
        secondaryAction={{
          label: a.ctaSecondary,
          href: '/contact',
        }}
      />
    </>
  );
}
