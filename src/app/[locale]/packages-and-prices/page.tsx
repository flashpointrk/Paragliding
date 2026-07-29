import type { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/site/LocaleLink';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

// Content is pulled from the database (Package), so this renders on the
// server for every request rather than being prerendered statically.
export const dynamic = 'force-dynamic';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { SectionHeading } from '@/components/site/SectionHeading';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import type { Package } from '@prisma/client';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { formatPrice } from '@/lib/i18n/format';
import { localeAlternates } from '@/lib/i18n/seo';
import { localizedText, localeList } from '@/lib/i18n/content';
import { FALLBACK_IMAGE } from '@/lib/images';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.packages.metaTitle,
    description: `${s.common.brandName} — ${s.packages.metaDescription}`,
    alternates: localeAlternates('/packages-and-prices', locale),
    openGraph: {
      title: s.packages.metaTitle,
      description: s.packages.ogDescription,
      url: '/packages-and-prices',
      type: 'website',
    },
  };
}

const INCLUDED_ICONS: ReadonlyArray<IconName> = ['Car', 'Coffee', 'Camera', 'Award'];
const PACKAGES_IMAGE_FALLBACK = FALLBACK_IMAGE.packagesHero;


async function getPackages(): Promise<Package[]> {
  try {
    return await prisma.package.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch {
    return [];
  }
}

async function getPackagesGalleryImages() {
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

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const pk = s.packages;
  const packages = await getPackages();
  const galleryImages = await getPackagesGalleryImages();
  const managedImages = await pageImages(locale, 'packages');
  const heroImage = pickImage(
    managedImages,
    'hero',
    galleryImages[0]?.url ?? PACKAGES_IMAGE_FALLBACK
  ) ?? PACKAGES_IMAGE_FALLBACK;
  const ctaImage = pickImage(
    managedImages,
    'cta',
    galleryImages[1]?.url ?? heroImage
  ) ?? heroImage;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: pk.metaTitle, path: '/packages-and-prices' },
  ];

  // The link inside the "refunds" note needs JSX, so it is built here.
  const notes: { title: string; text: React.ReactNode }[] = pk.notes.map(
    (n, i) =>
      i === 1
        ? {
            title: n.title,
            text: (
              <>
                {n.text.split('Mesafeli')[0]}
                <Link
                  href="/terms-of-sale"
                  className="font-semibold text-sky-700 hover:text-sky-800"
                >
                  {s.footer.termsOfSale}
                </Link>
              </>
            ),
          }
        : { title: n.title, text: n.text }
  );

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs)]} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900">
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
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/45 to-navy-950/20" />
        </div>
        <div className="container relative z-10 flex min-h-[36vh] flex-col justify-center py-20 text-white sm:py-28">
          <Reveal>
            <div className="max-w-3xl">
              <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
                {pk.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {pk.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                {pk.introText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHAT'S INCLUDED — four plain cards */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            eyebrow={pk.includedEyebrow}
            title={pk.includedTitle}
            description={pk.includedDescription}
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {INCLUDED_ICONS.map((icon, i) => {
              const h = pk.includedServices[i];
              if (!h) return null;
              return (
              <Card key={h.title} className="flex h-full flex-col gap-4 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon name={icon} className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-navy-900">
                  {h.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-600">{h.text}</p>
              </Card>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* PAKET GRID */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container">
          {/* With only two packages the third column would sit empty: the cards spread. */}
          {packages.length > 0 ? (
            <RevealGroup
              className={`grid gap-6 md:grid-cols-2 ${
                packages.length >= 3
                  ? 'lg:grid-cols-3'
                  : 'mx-auto max-w-4xl'
              }`}
            >
              {packages.map((p) => (
                <Reveal key={p.id}>
                  <Card
                    variant="default"
                    interactive
                    className="flex h-full flex-col gap-5 p-7"
                  >
                    <header className="flex flex-col gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-100 text-navy-700">
                        <Icon name="Package" className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h2 className="font-display text-xl font-semibold text-navy-900">
                        {localizedText(locale, p.name, p.nameTr)}
                      </h2>
                      <p className="text-sm leading-relaxed text-navy-600">
                        {localizedText(locale, p.description, p.descriptionTr)}
                      </p>
                    </header>

                    {p.content.length > 0 ? (
                      <ul className="space-y-2 text-sm text-navy-700">
                        {localeList(locale, p.content, p.contentTr).map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Icon
                              name="Check"
                              className="mt-0.5 h-4 w-4 flex-none text-sky-600"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-auto flex flex-col gap-4 border-t border-sand-200 pt-5">
                      {p.showPrice && p.priceMin != null ? (
                        <p className="text-sm text-navy-600">
                          {pk.start}{' '}
                          <span className="font-semibold text-navy-900">
                            {formatPrice(locale, p.priceMin)}
                          </span>
                        </p>
                      ) : (
                        <Badge variant="gray" className="self-start">
                          <Icon name="Info" className="h-3.5 w-3.5" aria-hidden="true" />
                          {pk.contactForPrice}
                        </Badge>
                      )}

                      <Link
                        href="/booking"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-400 px-5 text-sm font-semibold text-navy-950 shadow-soft transition-colors duration-200 ease-smooth hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
                      >
                        {pk.forThisPackage}
                        <Icon name="ArrowRight" className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </RevealGroup>
          ) : (
            <Reveal>
              <EmptyState
                icon="Package"
                title={pk.emptyTitle}
                description={pk.emptyText}
                action={
                  <Link
                    href="/contact"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-400 px-5 text-sm font-semibold text-navy-950 shadow-soft transition-colors hover:bg-brand-500"
                  >
                    {pk.ctaPrimary}
                  </Link>
                }
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* IMPORTANT NOTES */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            title={pk.notesTitle}
            description={pk.notesDescription}
            align="left"
          />
          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2">
            {notes.map((n) => (
              <Reveal key={n.title}>
                <Card variant="muted" className="flex gap-4 p-6">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white text-navy-700 shadow-soft">
                    <Icon name="Info" className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-semibold text-navy-900">
                      {n.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-navy-600">
                      {n.text}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={pk.ctaTitle}
        description={pk.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: pk.ctaPrimary,
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
