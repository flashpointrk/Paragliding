/**
 * Fallback page imagery.
 *
 * Every page image resolves here until the operator's own photographs are
 * uploaded through the admin panel. The moment a slot is filled in under
 * `/admin/page-content` the value below is bypassed — this file only answers
 * the question "what should we show when nothing is set?".
 *
 * Source: Unsplash. The Unsplash License allows commercial use with no
 * permission or attribution required (https://unsplash.com/license). No image
 * files are stored in the repository; they are served straight from the
 * Unsplash CDN.
 *
 * IMPORTANT: these are representative stock photographs. They do not show the
 * operator's actual launch site, equipment or pilots, and must never be
 * presented as evidence of a pilot licence, a safety procedure or flight
 * conditions. Replace them with the operator's own photos before going live.
 */

const UNSPLASH_CDN = 'https://images.unsplash.com';

/**
 * Builds an Unsplash image URL.
 *
 * `auto=format` serves webp/avif depending on browser support, and `fit=crop`
 * crops to the requested width while preserving the aspect ratio.
 */
function unsplash(id: string, width: number): string {
  return `${UNSPLASH_CDN}/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

/**
 * The Unsplash photo IDs in use.
 *
 * Each one was checked visually: all of them are genuine paragliding shots
 * (skydiving photos were weeded out by hand).
 */
const PHOTO = {
  /** Canopy gliding over hills at golden hour. Landscape. */
  goldenHour: 'photo-1578312055662-53316197d01e',
  /** Orange canopy above mountains at dusk. Landscape. */
  dusk: 'photo-1546936985-7b8df7a840d4',
  /** Flight over a forested mountain range. Landscape. */
  mountainView: 'photo-1506976697767-6c29c943ecbf',
  /** Yellow canopy above snowy peaks. Landscape. */
  summit: 'photo-1471247511763-88a722fc9919',
  /** Blue canopy above snowy mountains. Landscape. */
  mountainBlue: 'photo-1418846531910-2b7bb1043512',
  /** Red canopy among the clouds. Landscape. */
  clouds: 'photo-1603098091396-98fc15ec5ce3',
  /** Canopy being inflated on a meadow at sunset — the moment of take-off. Landscape. */
  takeoffWide: 'photo-1592208128295-5aaa34f1d72b',
  /** Take-off silhouette at sunset, canopy overhead. Portrait. */
  takeoff: 'photo-1592208127889-a44ea490c64b',
  /** Two canopies launching from a ridge, mountains behind. Portrait. */
  takeoffPair: 'photo-1694811401930-8c827ce2342c',
  /** Tandem flight — two people in the harness. Portrait. */
  tandem: 'photo-1719949122509-74d0a1d08b44',
  /** Red canopy over the coastline and the sea. Portrait. */
  coast: 'photo-1551891590-eeac39130199',
  /** Route across a wide valley at golden hour. Portrait. */
  route: 'photo-1500953925139-9d5fe7ba54f2',
  /** Orange canopy and a close-up of the pilot against a blue sky. Portrait. */
  equipment: 'photo-1598209500819-d79a1f16fd4d',
} as const;

/** 2000 px for wide areas (hero band, CTA background, OG image). */
const WIDE = 2000;
/** 1200 px for cards, squares and portraits. */
const CARD = 1200;

/**
 * Fallback images mapped onto the page slots.
 *
 * Names follow the slot's purpose; the same photo may serve several slots, as
 * the placeholder set is deliberately small.
 */
export const FALLBACK_IMAGE = {
  /** Home page hero band and the default OG image. */
  hero: unsplash(PHOTO.goldenHour, WIDE),
  /** Background of the closing CTA bands. */
  cta: unsplash(PHOTO.dusk, WIDE),
  /** Tandem flight page hero. */
  tandemHero: unsplash(PHOTO.clouds, WIDE),
  /** Take-off site page hero. */
  takeOffSiteHero: unsplash(PHOTO.mountainView, WIDE),
  /** Safety page hero. */
  safetyHero: unsplash(PHOTO.mountainBlue, WIDE),
  /** Packages page hero. */
  packagesHero: unsplash(PHOTO.summit, WIDE),
  /** About page hero. */
  aboutHero: unsplash(PHOTO.takeoffWide, WIDE),
  /** Pilots page hero. */
  pilotsHero: unsplash(PHOTO.tandem, WIDE),
  /** Hero for the contact and FAQ pages. */
  secondaryHero: unsplash(PHOTO.route, WIDE),
  /** Discover image in the top menu. */
  menu: unsplash(PHOTO.coast, CARD),

  /** Tandem/pilot emphasis — card and portrait areas. */
  tandem: unsplash(PHOTO.tandem, CARD),
  /** Safety and equipment emphasis. */
  equipment: unsplash(PHOTO.equipment, CARD),
  /** The moment of take-off. */
  takeoff: unsplash(PHOTO.takeoff, CARD),
  /** In flight / the route. */
  inflight: unsplash(PHOTO.route, CARD),
  /** Landing and approach. */
  landing: unsplash(PHOTO.equipment, CARD),
  /** Coastline and the take-off site. */
  coast: unsplash(PHOTO.coast, CARD),
  /** The flight experience — two canopies together. */
  experience: unsplash(PHOTO.takeoffPair, CARD),
} as const;

export type FallbackImageKey = keyof typeof FALLBACK_IMAGE;

/**
 * Placeholder set shown by the gallery page while the database is empty.
 *
 * The masonry layout places items without cropping, so each record needs its
 * true aspect ratio; the dimensions are derived from the source photograph.
 */
export const GALLERY_FALLBACK_IMAGES = [
  { url: FALLBACK_IMAGE.takeoff, category: 'takeoff', width: CARD, height: 1800 },
  { url: FALLBACK_IMAGE.inflight, category: 'inflight', width: CARD, height: 1500 },
  { url: FALLBACK_IMAGE.experience, category: 'inflight', width: CARD, height: 1800 },
  { url: FALLBACK_IMAGE.landing, category: 'landing', width: CARD, height: 1500 },
] as const;
