'use client';

import * as React from 'react';
import { m } from 'framer-motion';
import { easeSpring } from '@/lib/motion';
import { tel, wa } from '@/lib/contact-links';
import { Icon } from '@/components/ui/Icon';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';
import { useDictionary } from '@/lib/i18n/useDictionary';

/**
 * Fixed mobile contact bar.
 *
 * - A plain fade/slide-up entrance on mount (Framer Motion)
 * - Flat white surface with a thin hairline border on top
 * - Two buttons: WhatsApp (bg-green-500) and phone (bg-sky-500)
 * - The WhatsApp brand glyph plus the Lucide Phone icon
 * - Visible below `lg` only (hidden on desktop)
 *
 * Reads NEXT_PUBLIC_WHATSAPP and NEXT_PUBLIC_PHONE, and shows each button only
 * when its variable is set.
 */
export function CTAFloat() {
  const { s: sz } = useDictionary();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const phone = process.env.NEXT_PUBLIC_PHONE;

  const whatsappHref = whatsapp ? wa(whatsapp) : null;
  const phoneHref = phone ? tel(phone) : null;

  if (!whatsappHref && !phoneHref) return null;

  return (
    <m.div
      className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-2xl border border-sand-200 bg-white p-2 shadow-soft lg:hidden"
      role="region"
      aria-label={sz.common.quickContact}
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeSpring, delay: 0.3 }}
    >
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-green-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <WhatsAppGlyph className="h-5 w-5" />
          WhatsApp
        </a>
      ) : null}

      {phoneHref ? (
        <a
          href={phoneHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-sky-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Icon name="Phone" className="h-5 w-5" aria-hidden="true" />
          Ara
        </a>
      ) : null}
    </m.div>
  );
}
