'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { formatPrice } from '@/lib/i18n/format';

export interface PackagePickerOption {
  id: string;
  name: string;
  description?: string | null;
  content?: string[] | null;
  showPrice: boolean;
  priceMin?: number | null;
}

export interface PackagePickerProps {
  packages: PackagePickerOption[];
  selected: string | undefined;
  onChange: (id: string) => void;
  error?: string;
}


/**
 * Package selection grid — the "Open Sky" design language.
 *
 * Plain cards: a white surface with a hairline border. The selected card is
 * marked with a gold border on a pale gold surface. No glow, tilt or scale.
 *
 * One column on mobile, two on desktop. Behaves as a radio group
 * (role=radiogroup).
 */
export function PackagePicker({ packages, selected, onChange, error }: PackagePickerProps) {
  const { s: sz, locale } = useDictionary();
  if (packages.length === 0) {
    return (
      <Card variant="muted" className="p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-navy-500">
          <Icon name="Info" className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-sm text-navy-600">
          {sz.common.noPackages}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label={sz.common.packageChoice}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {packages.map((pkg) => {
          const active = selected === pkg.id;
          return (
            <label key={pkg.id} className="block h-full cursor-pointer">
              <input
                type="radio"
                name="packageId"
                value={pkg.id}
                checked={active}
                onChange={() => onChange(pkg.id)}
                className="sr-only"
              />
              <div
                className={cn(
                  'relative flex h-full flex-col gap-2 rounded-2xl border p-4 transition-colors duration-200',
                  active
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-sand-200 bg-white hover:border-sand-300 hover:shadow-soft-lg'
                )}
              >
                {/* Selection mark */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-200',
                    active
                      ? 'border-brand-500 bg-brand-400 text-navy-950'
                      : 'border-sand-300 bg-white text-transparent'
                  )}
                >
                  {active ? (
                    <Icon name="Check" className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : null}
                </span>

                <div className="pr-8">
                  <h4 className="font-display text-base font-semibold text-navy-900">
                    {pkg.name}
                  </h4>
                </div>

                {pkg.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-navy-600">
                    {pkg.description}
                  </p>
                ) : null}

                {pkg.content && pkg.content.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {pkg.content.slice(0, 4).map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-navy-600"
                      >
                        <Icon
                          name="Check"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-400"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {pkg.showPrice && typeof pkg.priceMin === 'number' ? (
                  <div className="mt-3">
                    <span className="inline-flex items-center rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-navy-700 ring-1 ring-inset ring-sand-200">
                      {sz.common.start} {formatPrice(locale, pkg.priceMin)}
                    </span>
                  </div>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <Icon name="AlertTriangle" className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
