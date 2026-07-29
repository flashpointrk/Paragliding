'use client';

import * as React from 'react';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';

/**
 * Plain skeleton for content pages: breadcrumb, title, notice and body. Used by
 * text-heavy pages, the legal ones included.
 *
 * - Editorial heading (the Sora display font, flat navy-900 text)
 * - Legible prose: generous line height, soft dark text
 * - Notice: a thin-bordered amber box with the lucide AlertTriangle icon
 * - Reveal animation (fade-up on scroll)
 *
 * @param items       Breadcrumb steps (the last one is the current page)
 * @param title       Page heading (h1)
 * @param intro       Introductory paragraph
 * @param notice      Optional draft/legal notice shown above the page
 * @param lastUpdated Optional "last updated" date (YYYY-MM-DD)
 */
export function PageProse({
  items,
  title,
  intro,
  warning,
  lastUpdated,
  children,
}: {
  items: { name: string; path?: string }[];
  title: string;
  intro?: React.ReactNode;
  warning?: React.ReactNode;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  const { s: sz } = useDictionary();
  return (
    <>
      <div className="container py-8">
        <Breadcrumbs items={items} />
      </div>

      <article className="container max-w-3xl pb-20">
        <Reveal>
          <header className="border-b border-sand-200 pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
              {title}
            </h1>
            {intro ? (
              <p className="mt-5 text-lg leading-relaxed text-navy-600">
                {intro}
              </p>
            ) : null}
            {lastUpdated ? (
              <p className="mt-4 text-xs text-navy-400">
                {sz.common.lastUpdated}: {lastUpdated}
              </p>
            ) : null}
          </header>
        </Reveal>

        {warning ? (
          <Reveal delay={0.05}>
            <aside
              role="note"
              className="mt-6 flex gap-3 rounded-xl border border-sunset-200 bg-sunset-50 p-4 text-sm text-sunset-900"
            >
              <Icon
                name="AlertTriangle"
                className="mt-0.5 h-5 w-5 flex-none text-sunset-500"
                aria-hidden="true"
              />
              <div className="space-y-1 leading-relaxed">{warning}</div>
            </aside>
          </Reveal>
        ) : null}

        <Reveal delay={0.1}>
          <div className="mt-10 space-y-8 text-base leading-relaxed text-navy-700">
            {children}
          </div>
        </Reveal>
      </article>
    </>
  );
}
