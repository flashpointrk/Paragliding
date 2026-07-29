import type { Metadata } from 'next';
import Image from 'next/image';

// Content is pulled from the database (GalleryMedia), so this renders on the
// server for every request rather than being prerendered statically.
export const dynamic = 'force-dynamic';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { SectionHeading } from '@/components/site/SectionHeading';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { localeAlternates } from '@/lib/i18n/seo';
import { fetchGalleryPage, GALLERY_DEFAULT_LIMIT } from '@/lib/gallery/query';
import { GalleryFeed } from '@/components/gallery/GalleryFeed';
import { FALLBACK_IMAGE, GALLERY_FALLBACK_IMAGES } from '@/lib/images';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.gallery.metaTitle,
    description: s.gallery.metaDescription,
    alternates: localeAlternates('/gallery', locale),
    openGraph: {
      title: s.gallery.metaTitle,
      description: s.gallery.ogDescription,
      url: '/gallery',
      type: 'website',
    },
  };
}

// Placeholder images — the copy comes from the dictionary, the source from
// `@/lib/images`. The dimensions carry the true aspect ratio for the uncropped
// masonry layout.
const PLACEHOLDER_IMAGE = GALLERY_FALLBACK_IMAGES;

async function fetchFirstPage() {
  try {
    return await fetchGalleryPage({ limit: GALLERY_DEFAULT_LIMIT });
  } catch {
    return { items: [], nextCursor: null };
  }
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const g = s.gallery;
  const { items, nextCursor } = await fetchFirstPage();
  const managedImages = await pageImages(locale, 'gallery');
  const ctaImage = pickImage(
    managedImages,
    'cta',
    FALLBACK_IMAGE.cta
  ) ?? FALLBACK_IMAGE.cta;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: g.title, path: '/gallery' },
  ];

  // Group the placeholder source by category (used while the database is empty).
  const placeholderSource = PLACEHOLDER_IMAGE.map((y, i) => ({
    url: pickImage(managedImages, `placeholder${i + 1}`, y.url) ?? y.url,
    alt: g.placeholders[i]?.alt ?? g.fallbackAlt,
    title: g.placeholders[i]?.title ?? '',
    category: y.category,
    width: y.width,
    height: y.height,
  }));
  const placeholderCategories = Array.from(
    new Set(placeholderSource.map((k) => k.category))
  );

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs)]} />

      {/* HERO */}
      <section className="bg-navy-900">
        <div className="container flex min-h-[36vh] flex-col justify-center py-20 text-white sm:py-28">
          <Reveal>
            <div className="max-w-3xl">
              <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
                {g.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {g.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                {g.introText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATEGORY SECTIONS — uncropped masonry at the true aspect ratios */}
      {items.length > 0 ? (
        <GalleryFeed
          initialItems={items}
          initialCursor={nextCursor}
          locale={locale}
        />
      ) : (
        <div className="bg-sand-50">
          {placeholderCategories.map((category) => {
            const items = placeholderSource.filter((k) => k.category === category);
            if (items.length === 0) return null;
            return (
              <section key={category} className="py-14 sm:py-16">
                <div className="container">
                  <SectionHeading
                    title={g.category[category as keyof typeof g.category] ?? category}
                    align="left"
                    size="sm"
                  />
                  <RevealGroup className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                    {items.map((item, i) => (
                      <Reveal key={`${item.url}-${i}`} className="mb-4 break-inside-avoid">
                        <figure className="relative overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 shadow-soft">
                          <Image
                            src={item.url}
                            alt={item.alt}
                            width={item.width}
                            height={item.height}
                            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="h-auto w-full"
                          />
                          {item.title ? (
                            <>
                              <div
                                className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy-950/70 to-transparent"
                                aria-hidden="true"
                              />
                              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-medium text-white">
                                {item.title}
                              </figcaption>
                            </>
                          ) : null}
                        </figure>
                      </Reveal>
                    ))}
                  </RevealGroup>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* UYARI */}
      <section className="bg-white py-12">
        <div className="container">
          <Reveal>
            {items.length === 0 ? (
              <Card className="mx-auto flex max-w-2xl items-center gap-4 p-6 text-center">
                <Icon
                  name="Image"
                  className="h-8 w-8 flex-none text-sky-600"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-navy-600">
                  {g.sampleWarning}
                </p>
              </Card>
            ) : (
              <p className="mx-auto max-w-2xl text-center text-xs text-navy-400">
                {g.consentNote}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={g.ctaTitle}
        description={g.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: s.common.submitBooking,
          href: '/booking',
          icon: 'ArrowRight',
        }}
        secondaryAction={{
          label: g.ctaSecondary,
          href: '/take-off-site/gokova-oren-alatepe-paragliding',
        }}
      />
    </>
  );
}
