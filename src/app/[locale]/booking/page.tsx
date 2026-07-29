import type { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/site/LocaleLink';
import { prisma } from '@/lib/prisma';
import { SITE } from '@/lib/site';

// Content is pulled from the database (Package, ContactSettings for the
// Turnstile siteKey), so this renders on the server for every request rather
export const dynamic = 'force-dynamic';
import { tel, wa } from '@/lib/contact-links';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { BookingForm } from '@/components/booking/BookingForm';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';
import { SectionHeading } from '@/components/site/SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { managedDictionary } from '@/lib/page-content';
import { localeAlternates } from '@/lib/i18n/seo';
import { localizedText, localeList } from '@/lib/i18n/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.booking.metaTitle,
    description: s.booking.metaDescription,
    alternates: localeAlternates('/booking', locale),
    openGraph: {
      title: s.booking.metaTitle,
      description: s.booking.ogDescription,
      url: '/booking',
      type: 'website',
    },
  };
}

interface TrustItem {
  icon: IconName;
  text: React.ReactNode;
}

const REASON_ICONS: IconName[] = ['Clock', 'CloudSun', 'ShieldCheck', 'Navigation'];


/**
 * The /booking page (server component) — a plain "Open Sky" frame.
 *
 * - Pulls the active packages from the database in sort order and passes them
 *   to the form as a prop.
 * - Trust signals are highlighted with plain cards and lucide icons.
 * - The form is a client component and receives the packages from here.
 *
 * Note: there is NO payment — this page only collects requests.
 */
export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const r = s.booking;
  // Fetch the active packages in sort order
  const packages = await prisma.package.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      nameTr: true,
      description: true,
      descriptionTr: true,
      content: true,
      contentTr: true,
      showPrice: true,
      priceMin: true,
    },
  });

  // Cloudflare Turnstile settings (the public siteKey only; the secret never
  const settings = await prisma.contactSettings.findUnique({
    where: { id: 'global' },
    select: { turnstileEnabled: true, turnstileSiteKey: true },
  });
  const turnstileSiteKey =
    settings?.turnstileEnabled && settings.turnstileSiteKey
      ? settings.turnstileSiteKey
      : null;

  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: r.eyebrow, path: '/booking' },
  ];

  const trustItems: TrustItem[] = [
    { icon: 'ShieldCheck', text: r.trustSsl },
    {
      icon: 'ShieldCheck',
      text: (
        <>
          {r.trustPrivacy.split('KVKK')[0]}
          <Link
            href="/privacy-policy"
            className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2"
          >
            {r.privacyConsentText}
          </Link>
        </>
      ),
    },
    { icon: 'ShieldCheck', text: r.trustUsage },
  ];

  // CTA for getting in touch (the SITE config, with an env fallback)
  const whatsapp = SITE.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP;
  const phone = SITE.phone ?? process.env.NEXT_PUBLIC_PHONE;
  const whatsappHref = whatsapp
    ? wa(whatsapp, r.whatsappMessage)
    : null;
  const phoneHref = phone ? tel(phone) : null;

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs)]} />

      {/* Breadcrumb */}
      <div className="container pt-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Title area */}
      <header className="container py-8 sm:py-12">
        <Reveal className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            {r.eyebrow}
          </span>
          <SectionHeading
            title={r.title}
            description={r.introText}
            className="mt-4"
          />
        </Reveal>
      </header>

      <div className="container pb-20 sm:pb-28">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <Reveal y={16}>
            <Card variant="default" className="p-5 sm:p-7">
              <BookingForm
                packages={packages.map((p) => ({
                  ...p,
                  name: localizedText(locale, p.name, p.nameTr),
                  description: localizedText(locale, p.description, p.descriptionTr),
                  content: localeList(locale, p.content, p.contentTr),
                }))}
                turnstileSiteKey={turnstileSiteKey}
              />
            </Card>
          </Reveal>

          {/* Side column: trust signals and the alternative */}
          <aside className="flex flex-col gap-4">
            <Reveal delay={0.1}>
              <Card variant="default" className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-100 text-navy-700">
                    <Icon name="Sparkles" className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 className="font-display text-base font-bold text-navy-900">
                    {r.reasonTitle}
                  </h2>
                </div>
                <ul className="flex flex-col gap-3">
                  {REASON_ICONS.map((icon, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-navy-600">
                      <Icon
                        name={icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-sky-600"
                        aria-hidden="true"
                      />
                      <span>{r.reasons[i]}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            <Reveal delay={0.15}>
              <Card variant="default" className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-100 text-navy-700">
                    <Icon name="ShieldCheck" className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 className="font-display text-base font-bold text-navy-900">
                    {r.trustTitle}
                  </h2>
                </div>
                <ul className="flex flex-col gap-3">
                  {trustItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-navy-600">
                      <Icon
                        name={item.icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-navy-500"
                        aria-hidden="true"
                      />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            {(whatsappHref || phoneHref) ? (
              <Reveal delay={0.2}>
                <Card variant="default" className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-100 text-navy-700">
                      <Icon name="Plane" className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h2 className="font-display text-base font-bold text-navy-900">
                      {r.quickTitle}
                    </h2>
                  </div>
                  <p className="mb-3 text-sm text-navy-600">
                    {r.quickText}
                  </p>
                  <div className="flex flex-col gap-2">
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-green-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
                      >
                        <WhatsAppGlyph className="h-4 w-4" />
                        {s.common.writeOnWhatsapp}
                      </a>
                    ) : null}
                    {phoneHref && phone ? (
                      <a
                        href={phoneHref}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-sand-200 px-4 text-sm font-semibold text-navy-800 transition-colors duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                      >
                        <Icon name="Phone" className="h-4 w-4" aria-hidden="true" />
                        {phone} — {s.common.search}
                      </a>
                    ) : null}
                  </div>
                </Card>
              </Reveal>
            ) : null}

            <Reveal delay={0.25}>
              <div className="flex items-start gap-2.5 rounded-xl border border-sand-200 bg-white p-4">
                <Icon
                  name="Info"
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-navy-500">
                  <strong className="text-navy-700">{r.important}</strong>{' '}
                  {r.importantNote}
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </>
  );
}
