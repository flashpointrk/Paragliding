'use client';

import * as React from 'react';
import { m } from 'framer-motion';
import { easeSpring } from '@/lib/motion';
import { SITE } from '@/lib/site';
import { wa } from '@/lib/contact-links';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';

/**
 * WhatsApp contact button, fixed to the bottom-left corner.
 *
 * - Springy fade plus upward slide on entry
 * - A continuous pulse ring (only when motion is welcome)
 * - A label that expands to the right on hover
 * - Renders nothing at all when `NEXT_PUBLIC_WHATSAPP` is unset
 */
export function WhatsAppFloat() {
  const { s: sz } = useDictionary();
  const number = SITE.whatsapp;
  if (!number) return null;

  return (
    <m.div
      className="fixed bottom-5 left-4 z-40 sm:bottom-6 sm:left-6"
      initial={{ opacity: 0, y: 24, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: easeSpring }}
    >
      <div className="relative">
        {/* Pulse rings — hidden when reduced motion is preferred */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping"
        />
        <span
          aria-hidden="true"
          className="absolute -inset-1.5 rounded-full bg-[#25D366]/25 motion-safe:animate-pulse"
        />

        <a
          href={wa(number, sz.booking.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={sz.common.writeOnWhatsapp}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft-lg outline-none transition-transform duration-200 ease-smooth hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <WhatsAppGlyph className="h-7 w-7" />

          {/* Hover label — pointer devices only */}
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-full bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-soft transition-opacity duration-200 ease-smooth group-hover:opacity-100 lg:block">
            {sz.common.writeOnWhatsapp}
          </span>
        </a>
      </div>
    </m.div>
  );
}
