'use client';

/**
 * Public gallery feed — uncropped masonry, infinite scroll and a lightbox.
 *
 * The first page is rendered on the server and arrives as props
 * (`initialItems`), for SEO and LCP. As the user approaches the sentinel
 * element at the end of the list, an `IntersectionObserver` fetches the next
 * page from `/api/gallery` and appends it.
 *
 * Items are listed as one continuous stream: category grouping and item titles
 * (the uploaded file name) are deliberately hidden — the gallery is about the
 * image itself.
 *
 * Clicking an item opens `GalleryLightbox`, where the arrow keys move between
 * items.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Reveal } from '@/components/motion/Reveal';
import { RevealGroup } from '@/components/motion/RevealGroup';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { localizedText } from '@/lib/i18n/content';
import { dictionary } from '@/lib/i18n/dictionary';
import type { GalleryItem } from '@/lib/gallery/types';
import { GalleryLightbox } from './GalleryLightbox';

// Safe default for records with unknown dimensions (an external URL, or an
// older row not yet backfilled) — prevents layout shift, fails quietly.
const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 1200;

const MASONRY_COLUMNS = 'columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4';

const SKELETON_HEIGHTS = [
  'h-48',
  'h-64',
  'h-56',
  'h-72',
  'h-60',
  'h-52',
  'h-68',
  'h-44',
];

export interface GalleryFeedProps {
  initialItems: GalleryItem[];
  initialCursor: string | null;
  /** The page locale (e.g. "tr" | "en") — selects the database copy. */
  locale: string;
}

export function GalleryFeed({
  initialItems,
  initialCursor,
  locale,
}: GalleryFeedProps) {
  const s = dictionary(locale);
  const g = s.gallery;

  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // A ref guarantees "one request at a time" across renders: state updates
  // are asynchronous, so relying on state alone would leave a race
  // condition open.
  const loadingRef = useRef(false);
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  async function loadMore() {
    if (loadingRef.current || cursorRef.current === null) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({ cursor: cursorRef.current });
      const res = await fetch(`/api/gallery?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error('The gallery could not be loaded.');
      }
      setItems((previous) => [...previous, ...(json.items as GalleryItem[])]);
      setCursor((json.nextCursor as string | null) ?? null);
    } catch {
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  // Observe the sentinel every time it mounts (e.g. when it becomes visible
  // again); the latest `loadMore` is reached through a ref so the effect does
  // not have to be torn down and rebuilt on every render.
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMoreRef.current();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // When the cursor changes the sentinel may leave the DOM and remount (or
    // disappear entirely), so it is in the deps to re-establish the observer.
  }, [cursor]);

  // --- Lightbox ---
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const buildAlt = useCallback(
    (item: GalleryItem) =>
      localizedText(
        locale,
        item.altText ?? item.title ?? '',
        item.altTextTr ?? item.titleTr
      ) || g.fallbackAlt,
    [locale, g.fallbackAlt]
  );

  // Lets the lightbox request the next page when it reaches the last item.
  const requestMore = useCallback(() => {
    void loadMoreRef.current();
  }, []);

  // Some browsers (notably under power saving or a strict autoplay policy)
  // will not start a muted video from the `autoPlay` attribute alone. Try to
  // start it explicitly once the media is ready; if permission is refused the
  // card stays on its first frame and plays in the lightbox when clicked.
  const videoPreviewRef = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;

    const play = () => {
      video.muted = true;
      void video.play().catch(() => {
        // Autoplay may be blocked by the browser or device; the lightbox player is
        // still available once the user clicks the card.
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      play();
    } else {
      video.addEventListener('canplay', play, { once: true });
    }
  }, []);

  return (
    <div className="bg-sand-50">
      <section className="py-12 sm:py-16">
        <div className="container">
          <RevealGroup className={cn(MASONRY_COLUMNS)}>
            {items.map((item, i) => {
              const alt = buildAlt(item);
              const video = item.type === 'video';

              return (
                <Reveal key={item.id} className="mb-4 break-inside-avoid">
                  {/* The whole item is clickable and opens the lightbox. Videos use a button
                      too, and play inside the lightbox, so the small preview is
                      not cluttered with controls. */}
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    aria-label={`${alt} — ${g.zoomIn}`}
                    className="group relative block w-full overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                  >
                    {video ? (
                      <video
                        ref={videoPreviewRef}
                        src={item.url}
                        width={item.width ?? DEFAULT_WIDTH}
                        height={item.height ?? DEFAULT_HEIGHT}
                        className="h-auto w-full"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                    ) : (
                      <Image
                        src={item.url}
                        alt={alt}
                        width={item.width ?? DEFAULT_WIDTH}
                        height={item.height ?? DEFAULT_HEIGHT}
                        // Uploaded files are served from the Docker volume by
                        // Nginx. The Next image optimizer cannot read these new
                        // files, which are absent from the container's own static
                        // output, so the browser must fetch them directly.
                        unoptimized={item.url.startsWith('/uploads/')}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="h-auto w-full transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
                      />
                    )}

                    {video ? (
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy-950/70 px-2.5 py-1 text-xs font-medium text-white"
                        aria-hidden="true"
                      >
                        <Icon name="Play" className="h-3.5 w-3.5" aria-hidden="true" />
                        {g.videoBadge}
                      </span>
                    ) : null}

                    {/* Slight dim plus a magnifier hint on hover */}
                    <span
                      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-950/0 opacity-0 transition-all duration-300 group-hover:bg-navy-950/25 group-hover:opacity-100"
                      aria-hidden="true"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy-900">
                        <Icon name={video ? 'Play' : 'Maximize2'} className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* Quiet status announcement for screen readers (visually this is already */}
      {/* conveyed by the skeleton and the end-of-list text). */}
      <div aria-live="polite" className="sr-only">
        {loading
          ? g.loadingMore
          : cursor === null
            ? g.allLoaded
            : ''}
      </div>

      {cursor !== null ? (
        <div ref={sentinelRef} className="container pb-14">
          {loading ? (
            <div className={cn(MASONRY_COLUMNS)} aria-hidden="true">
              {SKELETON_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    'mb-4 break-inside-avoid animate-pulse rounded-2xl bg-sand-200',
                    h
                  )}
                />
              ))}
            </div>
          ) : null}
          {error ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-navy-500">{g.uploadError}</p>
              <button
                type="button"
                onClick={() => void loadMore()}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
              >
                <Icon name="RefreshCw" className="h-4 w-4" aria-hidden="true" />
                {g.tryAgain}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="container pb-10 text-center text-xs text-navy-400">
          {g.allLoaded}
        </p>
      )}

      <GalleryLightbox
        items={items}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChangeHandler={setOpenIndex}
        requestMore={requestMore}
        altText={buildAlt}
        labels={{
          close: g.lightboxClose,
          previous: g.lightboxPrevious,
          next: g.lightboxNext,
          region: g.lightboxRegion,
        }}
      />
    </div>
  );
}
