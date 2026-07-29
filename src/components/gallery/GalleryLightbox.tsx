'use client';

/**
 * Gallery lightbox — shows the clicked image or video full screen.
 *
 * Navigation:
 *  - Left/right arrow keys (and the on-screen buttons) move between items
 *  - Esc, or a click on the backdrop, closes it
 *  - Home/End jump to the first and last item
 *
 * Infinite-scroll friendly: reaching the last item calls `requestMore`, and if
 * the feed loads another page `items` grows so the user can keep going (the
 * gallery page already shares the same list).
 *
 * Accessibility: `role="dialog" aria-modal`, focus moves into the dialog on
 * open, Tab cycles within it (focus trap), and focus returns to the trigger on
 * close. Page scrolling is locked while it is open.
 */

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import type { GalleryItem } from '@/lib/gallery/types';

// Safe default for records with unknown dimensions (same as the feed).
const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 1200;

export interface GalleryLightboxProps {
  items: GalleryItem[];
  /** Index of the open item; `null` means the lightbox is closed. */
  index: number | null;
  onClose: () => void;
  onChangeHandler: (newIndex: number) => void;
  /** Optional: request the next page when the last item is reached. */
  requestMore?: () => void;
  /** Builds the alt text for an item (the caller picks the locale). */
  altText: (item: GalleryItem) => string;
  labels: {
    close: string;
    previous: string;
    next: string;
    region: string;
  };
}

export function GalleryLightbox({
  items,
  index,
  onClose,
  onChangeHandler,
  requestMore,
  altText,
  labels,
}: GalleryLightboxProps) {
  const open = index !== null;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  // Remember the focused element on open, to restore focus on close.
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const item = index !== null ? items[index] : undefined;
  const isLast = index !== null && index >= items.length - 1;

  const advance = useCallback(
    (direction: 1 | -1) => {
      if (index === null) return;
      const target = index + direction;
      if (target < 0 || target >= items.length) return;
      onChangeHandler(target);
    },
    [index, items.length, onChangeHandler]
  );

  // On the last item, request the next page ahead of time so the user can
  // keep moving with the arrow keys.
  useEffect(() => {
    if (open && isLast) requestMore?.();
  }, [open, isLast, requestMore]);

  // Keyboard: Esc closes, arrows navigate, Home/End jump to the ends, Tab
  // keeps focus inside the dialog.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        advance(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        advance(-1);
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        onChangeHandler(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        onChangeHandler(items.length - 1);
        return;
      }
      if (e.key === 'Tab') {
        const root = dialogRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const ilk = focusable[0]!;
        const son = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === ilk) {
          e.preventDefault();
          son.focus();
        } else if (!e.shiftKey && document.activeElement === son) {
          e.preventDefault();
          ilk.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, advance, onChangeHandler, onClose, items.length]);

  // While open: lock page scrolling and move focus in; restore both on close.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open || !item) return null;

  const width = item.width ?? DEFAULT_WIDTH;
  const height = item.height ?? DEFAULT_HEIGHT;
  const ilkMi = index === 0;
  const sonMu = index === items.length - 1;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={labels.region}
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/95 p-4 outline-none sm:p-8"
    >
      {/* Kapat */}
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5 sm:top-5"
      >
        <Icon name="X" className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Counter */}
      <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white sm:top-6">
        {index + 1} / {items.length}
      </span>

      {/* Previous */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          advance(-1);
        }}
        disabled={ilkMi}
        aria-label={labels.previous}
        className="absolute left-2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-30 sm:left-5"
      >
        <Icon name="ChevronLeft" className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Sonraki */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          advance(1);
        }}
        disabled={sonMu}
        aria-label={labels.next}
        className="absolute right-2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-30 sm:right-5"
      >
        <Icon name="ChevronRight" className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Media — clicks stop here, because a backdrop click closes the dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-6xl"
      >
        {item.type === 'video' ? (
          <video
            key={item.id}
            src={item.url}
            width={width}
            height={height}
            className="max-h-[85vh] w-auto rounded-xl"
            controls
            autoPlay
            // Starts muted: someone arrowing through the gallery should not be
            // startled by sudden audio; they can unmute from the controls.
            muted
            loop
            playsInline
            aria-label={altText(item)}
          />
        ) : (
          <Image
            key={item.id}
            src={item.url}
            alt={altText(item)}
            width={width}
            height={height}
            unoptimized={item.url.startsWith('/uploads/')}
            sizes="100vw"
            priority
            className="max-h-[85vh] w-auto rounded-xl object-contain"
          />
        )}
      </div>
    </div>
  );
}
