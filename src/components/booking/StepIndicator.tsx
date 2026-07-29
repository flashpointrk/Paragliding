'use client';

import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { Icon } from '@/components/ui/Icon';

export interface StepIndicatorProps {
  /** The current step, counting from 1. */
  step: number;
  /** Total number of steps. */
  total: number;
  /** Step labels (indexed from 1). */
  labels: string[];
}

type StepState = 'tamamlandi' | 'mevcut' | 'bekliyor';

/**
 * Step indicator (stepper) — the "Open Sky" design language.
 *
 * Plain filled/empty circles joined by a thin connector.
 * - completed = a filled navy circle with a Check icon
 * - current   = a gold-outlined circle on a pale gold surface
 * - pending   = an empty circle with a thin sand outline
 *
 * No glow, pulse or gradient. Accessible: role="list", aria-current, aria-label.
 */
export function StepIndicator({ step, total, labels }: StepIndicatorProps) {
  const { s: sz } = useDictionary();
  return (
    <div className="w-full" aria-label={sz.common.formSteps}>
      {/* The circle and connector sequence */}
      <div className="flex items-center" role="list">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const status: StepState =
            n < step ? 'tamamlandi' : n === step ? 'mevcut' : 'bekliyor';
          const nextActive = n < step;

          return (
            <div key={n} className="flex flex-1 items-center last:flex-none">
              <div
                role="listitem"
                aria-current={n === step ? 'step' : undefined}
                aria-label={`${sz.common.step} ${n} / ${total}: ${labels[i] ?? ''}`}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-200',
                  status === 'tamamlandi' && 'border-navy-900 bg-navy-900 text-white',
                  status === 'mevcut' && 'border-brand-500 bg-brand-50 text-navy-900',
                  status === 'bekliyor' && 'border-sand-300 bg-white text-navy-400'
                )}
              >
                {status === 'tamamlandi' ? (
                  <Icon name="Check" className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  n
                )}
              </div>

              {n < total ? (
                <div
                  aria-hidden="true"
                  className={cn(
                    'mx-1.5 h-px flex-1 transition-colors duration-200',
                    nextActive ? 'bg-navy-900' : 'bg-sand-200'
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Active step label */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <p className="font-display text-sm font-semibold text-navy-900">
            {labels[step - 1] ?? `${sz.common.step} ${step}`}
          </p>
          <p className="text-xs text-navy-500">
            {step < total
              ? sz.common.toContinue
              : sz.common.lastCheck}
          </p>
        </div>

        <p className="text-xs font-semibold text-navy-400">
          <span className="text-navy-900">{step}</span>
          <span className="mx-0.5">/</span>
          {total}
        </p>
      </div>
    </div>
  );
}
