import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// Content is pulled from the database (ContactSettings), so this renders on
// the server for every request rather than being prerendered statically.
export const dynamic = 'force-dynamic';
import { SITE, LOCATION, CONTACTS } from '@/lib/site';
import { tel } from '@/lib/contact-links';
import { JsonLd } from '@/components/site/JsonLd';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { SectionHeading } from '@/components/site/SectionHeading';
import { ContactAvatar } from '@/components/site/ContactAvatar';
import { pickImage, pageImages, managedDictionary } from '@/lib/page-content';
import { localizedText } from '@/lib/i18n/content';
import { localeAlternates } from '@/lib/i18n/seo';
import { Reveal } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { ContactForm } from '@/components/contact/ContactForm';
import type { ContactSettings } from '@prisma/client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  return {
    title: s.contact.metaTitle,
    description: `${s.common.brandName} — ${s.contact.metaDescription}`,
    alternates: localeAlternates('/contact', locale),
    openGraph: {
      title: s.contact.metaTitle,
      description: `${s.common.brandName} — ${s.contact.ogDescription}`,
      url: '/contact',
      type: 'website',
    },
  };
}

async function getContactSettings(): Promise<ContactSettings | null> {
  try {
    // A single row is kept; fetch it by the "global" id.
    return await prisma.contactSettings.findUnique({ where: { id: 'global' } });
  } catch {
    return null;
  }
}

async function getContactGalleryImage() {
  try {
    const image = await prisma.galleryMedia.findFirst({
      where: { active: true, type: 'image' },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: { url: true },
    });
    return image?.url ?? null;
  } catch {
    return null;
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = await managedDictionary(locale);
  const i18 = s.contact;
  const settings = await getContactSettings();
  const galleryHeroImage = await getContactGalleryImage();
  const managedImages = await pageImages(locale, 'contact');
  const heroImage = pickImage(managedImages, 'hero', galleryHeroImage);

  // Prefer the database values, falling back to SITE/the environment.
  const phone = settings?.phone ?? SITE.phone;
  const whatsapp = settings?.whatsapp ?? SITE.whatsapp;
  const email = settings?.email ?? SITE.email;
  const address = settings?.address ?? LOCATION.addressLine;
  const openingHours = localizedText(
    locale,
    settings?.openingHours ?? LOCATION.openingHours,
    settings?.openingHoursTr ?? LOCATION.openingHoursTr
  );

  // Cloudflare Turnstile public siteKey (secret asla istemciye gitmez).
  // Disabled or an empty siteKey → null, and the form shows no widget.
  const turnstileSiteKey =
    settings?.turnstileEnabled && settings.turnstileSiteKey
      ? settings.turnstileSiteKey
      : null;

  const breadcrumbs = [
    { name: s.header.home, path: '/' },
    { name: i18.title, path: '/contact' },
  ];

  const INFO_ITEMS: {
    icon: IconName;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
  }[] = [
    // The phone and WhatsApp rows were dropped from this list; the numbers
    // already appear on the "Your contacts" cards below and on the fixed
    // WhatsApp button.
    ...(email
      ? [
          {
            icon: 'Mail' as IconName,
            label: i18.email,
            value: email,
            href: `mailto:${email}`,
          },
        ]
      : []),
    ...(address
      ? [{ icon: 'MapPin' as IconName, label: i18.address, value: address }]
      : []),
    ...(openingHours
      ? [
          {
            icon: 'Clock' as IconName,
            label: i18.openingHours,
            value: openingHours,
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs)]} />

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
                {i18.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {i18.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                {i18.introText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTENT — two columns: details plus the form */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <div className="container grid gap-8 lg:grid-cols-2">
          {/* Contact details — a plain card with a dl structure */}
          <Reveal>
            <div className="flex h-full flex-col gap-6">
              <SectionHeading title={i18.advisers} align="left" size="sm" />
              <Card className="p-2">
                <dl className="divide-y divide-sand-200">
                  {CONTACTS.map((c) => (
                    <div key={c.name} className="flex items-center gap-4 p-5">
                      <ContactAvatar gender={c.gender} name={c.name} roleLabel={s.common.adviser} />
                      <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                        <dt className="text-sm font-medium text-navy-800">
                          {c.name}
                          {c.note || c.noteTr ? (
                            <span className="ml-2 text-xs font-normal text-navy-400">
                              {localizedText(locale, c.note ?? '', c.noteTr ?? '')}
                            </span>
                          ) : null}
                        </dt>
                        <dd className="text-sm text-navy-600 sm:text-right">
                          <a
                            href={tel(c.phone)}
                            className="font-semibold text-sky-700 transition-colors hover:text-sky-800"
                          >
                            {c.phone}
                          </a>
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </Card>

              <SectionHeading title={i18.details} align="left" size="sm" />
              <Card className="flex-1 p-2">
                <dl className="divide-y divide-sand-200">
                  {INFO_ITEMS.map((b) => (
                    <div key={b.label} className="flex items-center gap-4 p-5">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                        <Icon name={b.icon} className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                        <dt className="text-sm font-medium text-navy-800">
                          {b.label}
                        </dt>
                        <dd className="text-sm text-navy-600 sm:text-right">
                          {b.href ? (
                            <a
                              href={b.href}
                              {...(b.external
                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                : {})}
                              className="font-semibold text-sky-700 transition-colors hover:text-sky-800"
                            >
                              {b.value}
                            </a>
                          ) : (
                            b.value
                          )}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </Card>

            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-4">
              <SectionHeading title={i18.writeToUsTitle} align="left" size="sm" />
              <p className="text-sm text-navy-500">
                {i18.writeToUsText}
              </p>
              <ContactForm turnstileSiteKey={turnstileSiteKey} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
