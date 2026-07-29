'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Accessible FAQ accordion.
 *
 * - Smooth height animation using the CSS `grid-template-rows: 0fr → 1fr`
 *   trick (paint-safe, performant, and it animates to `height: auto`)
 * - Plain card container with a thin border
 * - The + icon rotates 45° (becoming an × when open)
 * - Hover effect plus a focus-visible ring
 * - Only one item open at a time (accordion behaviour)
 * - Accessible: `aria-expanded`, `aria-controls`, the button + region pattern
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = React.useState<string | null>(
    items[0]?.id ?? null
  );

  return (
    <div className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `sss-panel-${item.id}`;
        const buttonId = `sss-button-${item.id}`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-navy-900 transition-colors duration-200',
                  isOpen ? 'bg-sand-50' : '',
                  'hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-inset'
                )}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sand-100 text-navy-700 transition-transform duration-300 ease-smooth',
                    isOpen ? 'rotate-45' : ''
                  )}
                >
                  <Icon name="Plus" className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </h3>
            {/* Smooth height animasyonu: grid-template-rows 0fr → 1fr trick */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-smooth',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-navy-600">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
