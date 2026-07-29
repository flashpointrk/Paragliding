'use client';

import { LocaleLink as Link } from '@/components/site/LocaleLink';
import { SITE, socialLinks, CONTACTS } from '@/lib/site';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { tel } from '@/lib/contact-links';
import { SocialGlyph } from '@/components/site/SocialGlyph';
import { ContactAvatar } from '@/components/site/ContactAvatar';
import { BrandMark } from './BrandMark';

/**
 * Site footer — the "Open Sky" design language. Solid navy, kept plain.
 *
 * - Logo (logo.png) plus the brand text
 * - Link groups (Discover/Company/Contact) — brightening towards white on hover
 * - Social links: inline SVG (Instagram/Facebook/Youtube)
 * - Base: a subtle copyright line plus the legal links
 *
 * Brand and contact data all come from one source (src/lib/site.ts).
 */

function footerLinkClasses() {
  return 'group relative inline-flex w-fit items-center text-sm text-sand-300 transition-colors duration-200 hover:text-white';
}

export function Footer() {
  const year = new Date().getFullYear();
  const socials = socialLinks();
  const { s } = useDictionary();

  return (
    <footer className="relative mt-auto bg-navy-900 text-sand-200">
      <div className="container relative grid gap-10 py-14 md:grid-cols-[1fr_0.8fr_0.8fr_1.4fr]">
        {/* Marka */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <Link
            href="/"
            className="inline-flex w-fit"
            aria-label={s.header.homeLink}
          >
            {/* The mark inks itself with `currentColor`, so it sits straight on
                the dark footer — no white plate needed behind it. */}
            <BrandMark
              className="flex items-center gap-3 text-white"
              glyphClassName="h-12 w-auto"
              wordmarkClassName="font-display text-xl font-extrabold uppercase tracking-tight"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-sand-300">
            {s.footer.description}
          </p>
          {SITE.operator ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-400">
              {s.footer.backedBy.replace('{isletme}', SITE.operator)}
            </p>
          ) : null}
        </div>

        {/* Discover */}
        <nav
          aria-label={s.footer.exploreSubmenu}
          className="flex flex-col gap-3"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
            {s.footer.explore}
          </h2>
          <div className="flex flex-col gap-2.5">
            <Link href="/tandem-flight" className={footerLinkClasses()}>
              {s.footer.tandemFlight}
            </Link>
            <Link
              href="/take-off-site/gokova-oren-alatepe-paragliding"
              className={footerLinkClasses()}
            >
              {s.footer.flightSite}
            </Link>
            <Link href="/packages-and-prices" className={footerLinkClasses()}>
              {s.footer.packagesAndPrices}
            </Link>
            <Link href="/live-conditions" className={footerLinkClasses()}>
              {s.footer.liveStatus}
            </Link>
            <Link href="/gallery" className={footerLinkClasses()}>
              {s.footer.gallery}
            </Link>
          </div>
        </nav>

        {/* Kurumsal */}
        <nav
          aria-label={s.footer.companySubmenu}
          className="flex flex-col gap-3"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
            {s.footer.company}
          </h2>
          <div className="flex flex-col gap-2.5">
            <Link href="/about-us" className={footerLinkClasses()}>
              {s.footer.about}
            </Link>
            <Link href="/safety" className={footerLinkClasses()}>
              {s.footer.safety}
            </Link>
            <Link href="/faq" className={footerLinkClasses()}>
              {s.footer.faq}
            </Link>
            <Link href="/contact" className={footerLinkClasses()}>
              {s.footer.contact}
            </Link>
            <Link href="/booking" className={footerLinkClasses()}>
              {s.footer.booking}
            </Link>
          </div>
        </nav>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
            {s.footer.contact}
          </h2>
          <div className="flex flex-col gap-2.5">
            {CONTACTS.map((c) => (
              <a
                key={c.name}
                href={tel(c.phone)}
                className={`${footerLinkClasses()} max-w-full gap-2.5`}
              >
                <ContactAvatar
                  gender={c.gender}
                  name={c.name}
                  roleLabel={s.common.adviser}
                  dark
                  className="h-8 w-8"
                />
                <span className="whitespace-nowrap text-sm">
                  <span className="font-semibold text-white/90">{c.name}</span>
                  <span className="mx-1 text-sand-400">·</span>
                  {c.phone}
                </span>
              </a>
            ))}
            {SITE.email ? (
              <a href={`mailto:${SITE.email}`} className={footerLinkClasses()}>
                {SITE.email}
              </a>
            ) : null}
            {SITE.altUrl ? (
              <a
                href={SITE.altUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={footerLinkClasses()}
              >
                {SITE.altUrl.replace(/^https?:\/\//, '')}
              </a>
            ) : null}
            <p className="text-xs leading-relaxed text-sand-400">
              {s.footer.address}
            </p>
          </div>

          {/* Social media — below contact, under its own heading */}
          {socials.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
                {s.footer.socialMedia}
              </h2>
              <div className="flex items-center gap-2">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sand-200 transition-colors duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <SocialGlyph name={social.name} className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-sand-400 sm:flex-row">
          <p>
            © {year} {s.common.brandName}. {s.footer.allRightsReserved}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-white"
            >
              {s.footer.privacy}
            </Link>
            <Link
              href="/terms-of-sale"
              className="transition-colors hover:text-white"
            >
              {s.footer.termsOfSale}
            </Link>
            <Link
              href="/cookie-policy"
              className="transition-colors hover:text-white"
            >
              {s.footer.cookiePolicy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
