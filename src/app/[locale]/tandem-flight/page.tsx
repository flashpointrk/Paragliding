import type { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/site/LocaleLink';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { SectionHeading } from '@/components/site/SectionHeading';
import { CtaSection } from '@/components/site/CtaSection';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import {
  breadcrumbJsonLd,
  serviceJsonLd,
  faqPageJsonLd,
} from '@/lib/seo/structured-data';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import type { Locale } from '@/lib/i18n/locales';
import { localeAlternates } from '@/lib/i18n/seo';
import { FALLBACK_IMAGE } from '@/lib/images';

// Gallery images updated from the panel appear on the page immediately.
export const dynamic = 'force-dynamic';

const TANDEM_IMAGE_FALLBACK = FALLBACK_IMAGE.tandemHero;

async function getTandemGalleryImages() {
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
  const { locale: rawLocale } = await params;
  const s = await managedDictionary(rawLocale);
  return {
    title: s.tandem.metaTitle,
    description: `${s.common.brandName} — ${s.tandem.metaDescription}`,
    alternates: localeAlternates('/tandem-flight', rawLocale),
    openGraph: {
      title: s.tandem.metaTitle,
      description: s.tandem.ogDescription,
      url: '/tandem-flight',
      type: 'article',
    },
  };
}







export default async function TandemFlightPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const s = await managedDictionary(rawLocale);
  const t = s.tandem;
  const locale: Locale = rawLocale === 'en' ? 'en' : 'tr';
  const galleryImages = await getTandemGalleryImages();
  const managedImages = await pageImages(locale, 'tandem');
  const heroImage = pickImage(
    managedImages,
    'hero',
    galleryImages[0]?.url ?? TANDEM_IMAGE_FALLBACK
  ) ?? TANDEM_IMAGE_FALLBACK;
  const ctaImage = pickImage(
    managedImages,
    'cta',
    galleryImages[1]?.url ?? heroImage
  ) ?? heroImage;
  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: t.eyebrow, path: '/tandem-flight' },
  ];

  const PROCESS_STEPS = t.processSteps;
  const SERVICE_ICONS: IconName[] = ['Car', 'Coffee', 'Camera', 'Award'];
  const WHATS_WAITING = t.pendingItems.map((b, i) => ({
    ...b,
    icon: (['Sunrise', 'CloudSun', 'Mountain'] as IconName[])[i] as IconName,
  }));
  const INFO_GRID: {
    title: string;
    icon: IconName;
    paragraph?: string;
    list?: readonly string[];
    note?: string;
  }[] = [
    { title: t.details.durationTitle, icon: 'Clock', paragraph: t.details.durationParagraph, note: t.details.durationNote },
    { title: t.details.whoTitle, icon: 'Users', list: t.details.whoList, note: t.details.whoNote },
    { title: t.details.includedTitle, icon: 'Package', list: t.includedItems, note: t.details.includedNote },
    { title: t.details.buildTitle, icon: 'Shirt', list: t.whatToBring },
    { title: t.details.routeTitle, icon: 'Navigation', list: t.details.routeList },
    { title: t.details.scheduleTitle, icon: 'Clock', paragraph: t.details.scheduleParagraph, note: t.details.scheduleNote },
  ];

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: t.jsonLdName,
            description: t.jsonLdDescription,
            path: '/tandem-flight',
            locale,
          }),
          breadcrumbJsonLd(breadcrumbs),
          faqPageJsonLd(t.jsonLdFaq),
        ]}
      />

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
                {t.eyebrow}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-5xl">
                {t.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand-100 sm:text-lg">
                {t.introText}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand-200 sm:text-base">
                {t.introCopy2}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHAT'S INCLUDED — four plain cards */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Fiyata dahil"
            title={t.includedTitle}
            description={t.includedDescription}
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {SERVICE_ICONS.map((icon, i) => { const h = s.packages.includedServices[i]; if (!h) return null; return (
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

      {/* WHAT TO EXPECT — three plain cards */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            title={t.pendingTitle}
            description={t.pendingDescription}
          />
          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {WHATS_WAITING.map((b) => (
              <Card key={b.title} className="flex h-full flex-col gap-4 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon name={b.icon} className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-navy-900">
                  {b.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-600">{b.text}</p>
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* THE FLIGHT PROCESS — a plain numbered card list */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container">
          <SectionHeading
            title={t.processTitle}
            description={t.processDescription}
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {PROCESS_STEPS.map((a, i) => (
              <Card key={a.title} interactive className="flex h-full flex-col gap-3 p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-brand-500 font-display text-sm font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-base font-semibold text-navy-900">
                    {a.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-navy-600">{a.text}</p>
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* INFO GRID — 2x2 plain cards */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <RevealGroup className="grid gap-6 lg:grid-cols-2" stagger={0.08}>
            {INFO_GRID.map((b) => (
              <Card key={b.title} className="flex h-full flex-col gap-4 p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Icon name={b.icon} className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">
                    {b.title}
                  </h2>
                </div>
                {b.paragraph ? (
                  <p className="text-sm leading-relaxed text-navy-600">{b.paragraph}</p>
                ) : null}
                {b.list ? (
                  <ul className="space-y-2 text-sm leading-relaxed text-navy-600">
                    {b.list.map((m) => (
                      <li key={m} className="flex items-start gap-2">
                        <Icon
                          name={b.icon === 'Shirt' ? 'ArrowRight' : 'Check'}
                          className="mt-0.5 h-4 w-4 flex-none text-sky-600"
                          aria-hidden="true"
                        />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {b.note ? <p className="mt-auto text-xs text-navy-400">{b.note}</p> : null}
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* IF POSTPONED — a plain information note */}
      <section className="bg-sand-50 py-16">
        <div className="container">
          <Reveal>
            <div className="mx-auto flex max-w-2xl gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-7">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white text-sky-600">
                <Icon name="CloudRain" className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-lg font-semibold text-navy-900">
                  {t.postponementTitle}
                </h2>
                <p className="text-sm leading-relaxed text-navy-600">
                  {t.postponementText}{' '}
                  <Link href="/safety" className="font-semibold text-sky-700 hover:text-sky-800">
                    {s.footer.safety}
                  </Link>{' '}
                  {t.postponementAnd}{' '}
                  <Link
                    href="/terms-of-sale"
                    className="font-semibold text-sky-700 hover:text-sky-800"
                  >
                    {s.footer.termsOfSale}
                  </Link>
                  {t.postponementAfter}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <CtaSection
        title={t.ctaTitle}
        description={t.ctaDescription}
        backgroundImage={ctaImage}
        primaryAction={{
          label: s.common.submitBooking,
          href: '/booking',
          icon: 'ArrowRight',
        }}
        secondaryAction={{
          label: t.ctaSecondary,
          href: '/faq',
        }}
      />
    </>
  );
}
