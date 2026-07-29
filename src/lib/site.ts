/**
 * Site-wide constants and helpers.
 *
 * The single source of truth for brand details, social links and location
 * data.
 */

/**
 * Everything that identifies the business is read from the environment. No real
 * phone number, personal name, e-mail address or social account is stored in
 * the repository; the fallbacks below are neutral placeholders. Real values are
 * supplied through `.env` (see `.env.example`).
 */
export const SITE = {
  /** Brand name. */
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Paragliding',
  /** Short brand name. */
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME ?? 'Paragliding',
  /** Parent brand / operating company. Hidden when undefined. */
  operator: process.env.NEXT_PUBLIC_OPERATOR ?? null,
  /** Default site description (metadata + Open Graph). */
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    'Tandem paragliding with experienced pilots. Safety first, transparent flight conditions and easy booking.',
  /** Locale tag in use. */
  locale: 'en_GB',
  /** Production base URL (should be set through the environment). */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000',
  /** Secondary domain. Falls back to the primary one when undefined. */
  altUrl: process.env.NEXT_PUBLIC_SITE_ALT_URL ?? null,
  /** Contact channels. */
  phone: process.env.NEXT_PUBLIC_PHONE ?? null,
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? null,
  email: process.env.NEXT_PUBLIC_EMAIL ?? null,
  /** Social accounts (optional). */
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? null,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? null,
    youtube: process.env.NEXT_PUBLIC_YOUTUBE ?? null,
  },
} as const;

/** A booking contact. */
export type SiteContact = {
  /** Display name. */
  name: string;
  /** Dialable phone number. */
  phone: string;
  /** Languages spoken (informational). */
  langs?: string[];
  /** Role note in the default locale. */
  note?: string;
  /** Role note in Turkish. */
  noteTr?: string;
  /** Drives the avatar illustration. */
  gender?: 'man' | 'woman';
};

/**
 * Reads the contact list from `NEXT_PUBLIC_CONTACTS` as JSON.
 *
 * Names and mobile numbers are personal data, so they live in the environment
 * rather than the repository. Undefined or malformed JSON yields an empty list
 * and the contact sections are hidden — it never throws, and the page keeps
 * working.
 *
 * Example:
 *   NEXT_PUBLIC_CONTACTS='[{"name":"Name","phone":"+90 5XX XXX XX XX","note":"Bookings"}]'
 */
function readAdvisers(): SiteContact[] {
  const ham = process.env.NEXT_PUBLIC_CONTACTS;
  if (!ham) return [];
  try {
    const data: unknown = JSON.parse(ham);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (k): k is SiteContact =>
        typeof k === 'object' &&
        k !== null &&
        typeof (k as SiteContact).name === 'string' &&
        typeof (k as SiteContact).phone === 'string'
    );
  } catch {
    return [];
  }
}

/** Booking contacts. Empty array when undefined. */
export const CONTACTS: SiteContact[] = readAdvisers();

/**
 * Business location: Gökova Ören / Alatepe (Muğla/Ula).
 * Note: the coordinates are for planning; confirm them with the pilot before
 * going live.
 */
export const LOCATION = {
  name: 'Gökova Ören / Alatepe',
  region: 'Muğla / Ula',
  addressLine: 'Alatepe take-off site, Gulf of Gökova, Ören, 48600 Ula/Muğla',
  /** Latitude (approximate). A preliminary value, to be confirmed. */
  lat: 37.02,
  /** Longitude (approximate). A preliminary value, to be confirmed. */
  lng: 28.27,
  /** Opening hours (free text; also fed from ContactSettings in the database). */
  openingHours: 'April–October, every day 09:00–19:00',
  /** Opening hours — Turkish copy. */
  openingHoursTr: 'Nisan–Ekim arası, her gün 09:00–19:00',
} as const;

/** Returns the social links that are actually set. */
export function socialLinks(): { name: string; href: string }[] {
  const out: { name: string; href: string }[] = [];
  const { social } = SITE;
  if (social.instagram)
    out.push({ name: 'Instagram', href: social.instagram });
  if (social.facebook)
    out.push({ name: 'Facebook', href: social.facebook });
  if (social.youtube) out.push({ name: 'YouTube', href: social.youtube });
  return out;
}
