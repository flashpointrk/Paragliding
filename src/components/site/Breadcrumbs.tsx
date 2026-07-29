'use client';

import { LocaleLink as Link } from '@/components/site/LocaleLink';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { useDictionary } from '@/lib/i18n/useDictionary';

/**
 * Breadcrumb component.
 *
 * - Plain pill container with a thin border
 * - Lucide ChevronRight separators
 * - Accessible: a nav with `aria-label`, and `aria-current="page"` on the last
 *   step
 *
 * @param items { name, path }[] — every entry but the last renders as a link.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: { name: string; path?: string }[];
  className?: string;
}) {
  const { s: sz } = useDictionary();
  return (
    <nav
      aria-label={sz.common.pagePath}
      className={cn(className)}
    >
      <ol className="inline-flex flex-wrap items-center gap-1 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-sm">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li
              key={`${item.name}-${idx}`}
              className="flex items-center gap-1.5"
            >
              {item.path && !isLast ? (
                <Link
                  href={item.path}
                  className="rounded-full px-1.5 py-0.5 text-navy-500 transition-colors duration-200 hover:bg-sand-50 hover:text-navy-900"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="rounded-full px-1.5 py-0.5 font-medium text-navy-900"
                >
                  {item.name}
                </span>
              )}
              {!isLast ? (
                <Icon
                  name="ChevronRight"
                  className="h-3.5 w-3.5 flex-none text-navy-300"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
