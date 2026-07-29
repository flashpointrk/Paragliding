'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Turnstile } from '@/components/ui/Turnstile';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/motion/Reveal';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { PackagePicker, type PackagePickerOption } from '@/components/booking/PackagePicker';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/useDictionary';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { translateError, translateErrors } from '@/lib/i18n/errors';
import { Icon } from '@/components/ui/Icon';
import { WhatsAppGlyph } from '@/components/ui/WhatsAppGlyph';
import { wa } from '@/lib/contact-links';
import {
  bookingSchema,
  stepSchema,
  STEP_COUNT,
  WEIGHT_RANGES,
  LOCALES,
  MEDIA_PREFERENCES,
  type BookingFormData,
} from '@/lib/booking/schema';
import {
  FLIGHT_SLOTS,
  CLOSING_MINUTES,
  isSlotAvailable,
  availableSlots,
  earliestDate,
  nearestSlot,
  businessNow,
  dateText,
} from '@/lib/booking/flight-slots';
import type { z } from 'zod';

// --- Sabitler ---

const DRAFT_KEY = 'yp-rezervasyon-taslak-v1';

// The ranges cover every weight; the "I'll note it below" option was removed
// because selecting it did nothing at all.
const WEIGHT_VALUES = ['<50', '50-80', '80-100', '100-110', '110+'] as const;

/** Slot times and availability rules come from a single source. */

/**
 * Form state type. Based on the Zod input type but with some fields made
 * optional, for values the user has not filled in yet (weightRange and
 * mediaPreference may still be unset). The full schema runs again before
 * submit.
 */
type FormState = Omit<BookingFormData, 'weightRange' | 'mediaPreference'> & {
  weightRange?: (typeof WEIGHT_RANGES)[number];
  mediaPreference?: (typeof MEDIA_PREFERENCES)[number];
};

/** Empty form state. The date/time defaults to the nearest available slot. */
function bosForm(): FormState {
  const yakin = nearestSlot();
  return {
    packageId: '',
    preferredDate: yakin.date,
    alternateDate: undefined,
    preferredTime: yakin.hour,
    guestCount: 1,
    weightRange: undefined,
    fullName: '',
    phone: '',
    email: '',
    locale: 'TR',
    transferRequested: false,
    mediaPreference: 'none',
    note: '',
    privacyConsent: false,
    explicitConsent: false,
    honeypot: '',
  };
}

export interface BookingFormProps {
  /** Active packages, supplied by the server parent. */
  packages: PackagePickerOption[];
  /**
   * Cloudflare Turnstile public site key (supplied by the server).
   * When set — and Turnstile is enabled — the widget appears at step 6 and a
   * token becomes mandatory. Null or empty means Turnstile is off and no widget
   * is shown.
   */
  turnstileSiteKey?: string | null;
}

type Errors = Partial<Record<keyof BookingFormData, string>>;

type SubmitState =
  | { status: 'bos' }
  | { status: 'gonderiliyor' }
  | { status: 'successful'; id: string }
  | { status: 'hata'; message: string };

/**
 * Multi-step booking (request) form — "Open Sky" design language.
 *
 * The flow:
 *  1. Package selection
 *  2. Date and time
 *  3. Participants (guest count, weight)
 *  4. Contact details (name, phone, e-mail, locale)
 *  5. Extras (transfer, media, note)
 *  6. Consent (privacy, explicit consent, honeypot)
 *
 * Visual language:
 *  - Plain white card surfaces, hairline borders, no heavy shadows
 *  - StepIndicator: simple filled/empty dots and a thin rule (no glow or pulse)
 *  - Step transitions: a single subtle fade-up (Reveal), no slide or parallax
 *  - Success screen: a plain check icon, no gradient or glow
 *  - All business logic preserved (Zod, localStorage, honeypot, Turnstile)
 */
export function BookingForm({ packages, turnstileSiteKey }: BookingFormProps) {
  const { s: sz, locale } = useDictionary();
  const r = sz.booking;
  const [form, setForm] = React.useState<FormState>(bosForm);
  const [step, setStep] = React.useState(1);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submit, setSubmit] = React.useState<SubmitState>({ status: 'bos' });
  const [hydrated, setHydrated] = React.useState(false);
  /** Short notice shown when the date/time shifted because a slot closed. */
  const [slotInfo, setSlotInfo] = React.useState<string | null>(null);

  // Cloudflare Turnstile token (produced at step 6). Stays null when disabled.
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);

  // Is Turnstile enabled? The widget shows when a site key is present.
  const turnstileEnabled = Boolean(turnstileSiteKey && turnstileSiteKey.length > 0);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const whatsappHref = whatsapp
    ? wa(whatsapp, r.whatsappMessage)
    : null;

  // --- Load the draft (once, on mount) ---
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BookingFormData>;
        // A draft's date/time may have fallen into the past → pull it to the nearest
        // available slot, otherwise an old draft restores an invalid selection.
        const yakin = nearestSlot();
        const draftDate = parsed.preferredDate;
        const validDate =
          draftDate && draftDate >= yakin.date ? draftDate : yakin.date;
        const draftTime = parsed.preferredTime;
        const selectedSlot = FLIGHT_SLOTS.find((s) => s.value === draftTime);
        const validTime =
          selectedSlot && isSlotAvailable(validDate, selectedSlot.minutes)
            ? selectedSlot.value
            : (availableSlots(validDate)[0]?.value ?? '');
        // Only take known fields; the honeypot is excluded
        setForm((previous) => ({
          ...previous,
          ...parsed,
          preferredDate: validDate,
          preferredTime: validTime,
          honeypot: '', // the honeypot is never restored
          privacyConsent: false, // consent is always asked for again
          explicitConsent: false,
        }));
      }
    } catch {
      // Bozuk taslak — yoksay
    }
    setHydrated(true);
  }, []);

  // --- Save the draft (debounced, on change) ---
  React.useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      try {
        // Keep contact details and consent out of the draft (privacy best practice)
        const { honeypot, ...toSave } = form;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      } catch {
        // localStorage yoksa veya doluysa yoksay
      }
    }, 400);
    return () => clearTimeout(id);
  }, [form, hydrated]);

  // If no slot is left for today when the form opens, tell the user:
  // the date quietly moved to tomorrow, so make the reason visible.
  React.useEffect(() => {
    const { date } = businessNow();
    if (availableSlots(date).length === 0) {
      setSlotInfo(
        r.slotClosedNotice.replace('{occurredAt}', dateText(earliestDate()))
      );
    }
  }, [r.slotClosedNotice]);

  // --- Slot closing check ---
  // A slot cannot be chosen with less than CLOSING_MINUTES to take-off. An
  // invalid selection rolls to the next slot, or to the next day if none remain.
  // Repeats every minute: the threshold can pass while the form is open.
  React.useEffect(() => {
    if (!hydrated) return;
    const date = form.preferredDate;
    if (!date) return;

    const check = () => {
      const availableSlotList = availableSlots(date);

      if (availableSlotList.length === 0) {
        const yakin = nearestSlot();
        setForm((o) => ({
          ...o,
          preferredDate: yakin.date,
          preferredTime: yakin.hour,
        }));
        setSlotInfo(
          r.dateRecordNote.replace('{occurredAt}', dateText(yakin.date))
        );
        return;
      }

      const selected = FLIGHT_SLOTS.find((s) => s.value === form.preferredTime);
      if (!selected || !isSlotAvailable(date, selected.minutes)) {
        const next = availableSlotList[0]!;
        setForm((o) => ({ ...o, preferredTime: next.value }));
        setSlotInfo(
          r.slotRecordNote
            .replace('{dk}', String(CLOSING_MINUTES))
            .replace('{saat}', next.hour)
        );
      }
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [form.preferredDate, form.preferredTime, hydrated, r.slotRecordNote, r.dateRecordNote]);

  // Clear the draft on success
  React.useEffect(() => {
    if (submit.status === 'successful') {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // yoksay
      }
    }
  }, [submit.status]);

  // --- Field update helper ---
  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
    // Clear the error on this field
    if (errors[field]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  }

  // --- Step validation ---
  function validateStep(n: number): boolean {
    const schema = stepSchema[n as keyof typeof stepSchema];
    if (!schema) return true;
    const result = schema.safeParse(form);
    if (result.success) {
      return true;
    }
    const newErrors: Errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof BookingFormData;
      if (!newErrors[field]) {
        newErrors[field] = translateError(locale, issue.message);
      }
    }
    setErrors((previous) => ({ ...previous, ...newErrors }));
    return false;
  }

  function forward() {
    if (submit.status === 'gonderiliyor') return;
    if (!validateStep(step)) return;
    if (step < STEP_COUNT) {
      setStep((a) => a + 1);
      // Scroll to the top (helpful between steps)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  function back() {
    if (submit.status === 'gonderiliyor') return;
    if (step > 1) {
      setStep((a) => a - 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // --- Submit ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submit.status === 'gonderiliyor') return;

    // Turnstile aktifse token zorunlu.
    if (turnstileEnabled && !turnstileToken) {
      setErrors((previous) => ({
        ...previous,
        turnstileToken: r.completeVerification,
      }));
      if (step !== STEP_COUNT) setStep(STEP_COUNT);
      return;
    }

    // Validate the final step
    if (!validateStep(STEP_COUNT)) return;

    // Full schema validation
    const allResults = bookingSchema.safeParse(form);
    if (!allResults.success) {
      const allErrors: Errors = {};
      for (const issue of allResults.error.issues) {
        const field = issue.path[0] as keyof BookingFormData;
        if (!allErrors[field]) allErrors[field] = translateError(locale, issue.message);
      }
      setErrors(allErrors);
      // Jump back to the first step with an error
      const firstErrorStep = findErrorStep(allErrors);
      if (firstErrorStep) setStep(firstErrorStep);
      return;
    }

    setSubmit({ status: 'gonderiliyor' });
    try {
      const resp = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...allResults.data,
          turnstileToken: turnstileEnabled ? turnstileToken : undefined,
        }),
      });
      const data = (await resp.json()) as {
        ok: boolean;
        id?: string;
        errors?: Record<string, string>;
        message?: string;
      };

      if (resp.ok && data.ok && data.id) {
        setSubmit({ status: 'successful', id: data.id });
        return;
      }

      // Surface any validation errors on their fields
      if (data.errors) {
        const wrapped = translateErrors(locale, data.errors) as Errors;
        setErrors(wrapped);
        const firstErrorStep = findErrorStep(wrapped);
        if (firstErrorStep) setStep(firstErrorStep);
      }
      setSubmit({
        status: 'hata',
        message: data.message ? translateError(locale, data.message) : r.generalError,
      });
    } catch {
      setSubmit({
        status: 'hata',
        message:
          r.errorConnection,
      });
    }
  }

  // --- Success screen ---
  if (submit.status === 'successful') {
    return <SuccessScreen id={submit.id} whatsappHref={whatsappHref} sz={sz} />;
  }

  const submitting = submit.status === 'gonderiliyor';

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <StepIndicator
        step={step}
        total={STEP_COUNT}
        labels={r.steps}
      />

      {/* Genel hata bildirimi */}
      {submit.status === 'hata' ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <Icon
            name="AlertTriangle"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-red-800">{submit.message}</p>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                <WhatsAppGlyph className="h-4 w-4" />
                {r.reachUsOnWhatsapp}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Step content — a single subtle fade-up, replayed on each step change */}
      <Reveal key={step} y={12}>
          {/* --- STEP 1: package selection --- */}
          {step === 1 ? (
            <StepSection title={r.step1Title} description={r.step1Description}>
              <PackagePicker
                packages={packages}
                selected={form.packageId || undefined}
                onChange={(id) => updateField('packageId', id)}
                error={errors.packageId}
              />
            </StepSection>
          ) : null}

          {/* --- STEP 2: date and time --- */}
          {step === 2 ? (
            <StepSection title={r.step2Title} description={r.step2Description}>
              <div className="flex flex-col gap-5">
                <div className="sm:max-w-xs">
                  <Input
                    label={r.date}
                    type="date"
                    required
                    min={earliestDate()}
                    value={form.preferredDate ?? ''}
                    onChange={(e) => {
                      setSlotInfo(null);
                      updateField('preferredDate', e.target.value);
                    }}
                    error={errors.preferredDate}
                    hint={r.dateHint}
                  />
                </div>

                {/* Slots close 30 min before take-off; report it when the selection shifts. */}
                {slotInfo ? (
                  <p className="flex items-start gap-2 rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-navy-700">
                    <Icon
                      name="Info"
                      className="mt-0.5 h-4 w-4 shrink-0 text-sky-500"
                      aria-hidden="true"
                    />
                    {slotInfo}
                  </p>
                ) : null}

                {/* Slot time — two departures a day */}
                <fieldset>
                  <legend className="text-sm font-medium text-navy-800">
                    {r.slotTime}
                  </legend>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {FLIGHT_SLOTS.map((slot) => {
                      const selected = form.preferredTime === slot.value;
                      const suitable = isSlotAvailable(
                        form.preferredDate ?? '',
                        slot.minutes
                      );
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          aria-pressed={selected}
                          disabled={!suitable}
                          onClick={() => updateField('preferredTime', slot.value)}
                          className={cn(
                            'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
                            !suitable
                              ? 'cursor-not-allowed border-sand-200 bg-sand-50 text-navy-400'
                              : selected
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-navy-200 bg-white hover:border-navy-300'
                          )}
                        >
                          <span
                            className={cn(
                              'text-sm font-medium',
                              suitable ? 'text-navy-800' : 'text-navy-400'
                            )}
                          >
                            {slot.value === '09:00' ? r.morning : r.afternoon}
                            {!suitable ? ` · ${r.closed}` : ''}
                          </span>
                          <span
                            className={cn(
                              'font-display text-lg font-bold',
                              suitable ? 'text-navy-900' : 'text-navy-400'
                            )}
                          >
                            {slot.hour}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.preferredTime ? (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.preferredTime}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-navy-500">
                      {r.slotNote}
                    </p>
                  )}
                </fieldset>
              </div>
            </StepSection>
          ) : null}

          {/* --- STEP 3: participants --- */}
          {step === 3 ? (
            <StepSection title={r.step3Title} description={r.step3Description}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={r.guestCount}
                  type="number"
                  required
                  min={1}
                  max={10}
                  value={String(form.guestCount ?? '')}
                  onChange={(e) =>
                    updateField('guestCount', Number(e.target.value))
                  }
                  error={errors.guestCount}
                  hint={r.guestCountHint}
                />
                <Select
                  label={r.weightRangeLabel}
                  required
                  placeholder={r.weightSelect}
                  options={WEIGHT_VALUES.map((value, i) => ({
                    value: value,
                    label: r.weightOptions[i] ?? value,
                  }))}
                  value={form.weightRange ?? ''}
                  onChange={(e) =>
                    updateField('weightRange', e.target.value as (typeof WEIGHT_RANGES)[number])
                  }
                  error={errors.weightRange}
                  hint={r.weightHint}
                />
              </div>
            </StepSection>
          ) : null}

          {/* --- STEP 4: contact details --- */}
          {step === 4 ? (
            <StepSection title={r.step4Title} description={r.step4Description}>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label={r.fullName}
                  required
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  error={errors.fullName}
                  placeholder={r.fullNameHint}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={r.phone}
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    error={errors.phone}
                    placeholder={r.phoneHint}
                  />
                  <Input
                    label={r.email}
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    placeholder={r.emailHint}
                  />
                </div>
                <Select
                  label={r.localePreference}
                  options={[
                    { value: 'TR', label: r.turkish },
                    { value: 'EN', label: r.english },
                  ]}
                  value={form.locale}
                  onChange={(e) => updateField('locale', e.target.value as (typeof LOCALES)[number])}
                  hint={r.localeHint}
                />
              </div>
            </StepSection>
          ) : null}

          {/* --- STEP 5: confirmation --- */}
          {step === 5 ? (
            <StepSection title={r.step5Title} description={r.step5Description}>
              <div className="grid grid-cols-1 gap-4">
                <Card variant="muted" className="p-4">
                  <Checkbox
                    label={
                      <>
                        <Link
                          href="/privacy-policy"
                          className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {r.privacyConsentText}
                        </Link>
                        {r.privacyConsentExtra}
                      </>
                    }
                    checked={form.privacyConsent}
                    onChange={(e) => updateField('privacyConsent', e.target.checked)}
                    error={errors.privacyConsent}
                  />
                </Card>
                <Card variant="muted" className="p-4">
                  <Checkbox
                    label={
                      <>
                        {r.explicitConsentBefore}{' '}
                        <strong className="text-navy-900">{r.explicitConsentHighlight}</strong>{' '}
                        {r.explicitConsentAfter}
                      </>
                    }
                    checked={form.explicitConsent}
                    onChange={(e) => updateField('explicitConsent', e.target.checked)}
                    error={errors.explicitConsent}
                  />
                </Card>

                {/* Cloudflare Turnstile bot protection (when enabled) */}
                {turnstileEnabled ? (
                  <Card variant="muted" className="p-4">
                    <Turnstile
                      siteKey={turnstileSiteKey!}
                      onToken={setTurnstileToken}
                      error={errors.turnstileToken}
                      hint={r.turnstileHint}
                    />
                  </Card>
                ) : null}

                <Card variant="muted" className="flex items-start gap-3 p-4">
                  <Icon
                    name="Info"
                    className="mt-0.5 h-5 w-5 shrink-0 text-sky-500"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed text-navy-600">
                    {r.consentNote}
                  </p>
                </Card>

                {/* Honeypot — visually hidden, filled in by bots */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="web-sitesi">{r.honeypot}</label>
                  <input
                    id="web-sitesi"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.honeypot ?? ''}
                    onChange={(e) => updateField('honeypot', e.target.value)}
                  />
                </div>
              </div>
            </StepSection>
          ) : null}
      </Reveal>

      {/* --- Navigasyon --- */}
      <div className="flex items-center justify-between gap-3 border-t border-sand-200 pt-5">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={back}
          disabled={step === 1 || submitting}
        >
          <span aria-hidden="true">←</span> {sz.common.back}
        </Button>

        {step < STEP_COUNT ? (
          <Button type="button" variant="primary" size="md" onClick={forward}>
            {sz.common.forward} <span aria-hidden="true">→</span>
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={submitting}
            disabled={submitting || (turnstileEnabled && !turnstileToken)}
            title={
              turnstileEnabled && !turnstileToken
                ? r.completeVerification
                : undefined
            }
          >
            {submitting
              ? r.submitting
              : turnstileEnabled && !turnstileToken
                ? r.awaitingVerification
                : r.submitRequest}
          </Button>
        )}
      </div>
    </form>
  );
}

// --- Helper components ---

function StepSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-bold text-navy-900">{title}</h3>
        {description ? (
          <p className="text-sm text-navy-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SuccessScreen({
  id,
  whatsappHref,
  sz,
}: {
  id: string;
  whatsappHref: string | null;
  sz: Dictionary;
}) {
  const r = sz.booking;
  return (
    <Reveal y={12}>
      <Card
        variant="default"
        className="flex flex-col items-center gap-5 p-8 text-center sm:p-10"
        role="status"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600">
          <Icon name="CheckCircle2" className="h-11 w-11" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-display text-2xl font-semibold text-navy-900">
            {r.successTitle}
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-navy-600">
            {r.successTextBefore}{' '}
            <strong className="text-navy-900">{r.successHighlight}</strong>{' '}
            {r.successTextAfter}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-sand-200 bg-sand-50 px-4 py-2">
          <span className="text-xs font-medium text-navy-500">{r.requestNumber}</span>
          <span className="font-mono text-sm font-semibold text-navy-800">{id}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => window.location.reload()}
          >
            {r.newRequest}
          </Button>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-green-500 px-5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              {sz.common.writeOnWhatsapp}
            </a>
          ) : null}
        </div>
      </Card>
    </Reveal>
  );
}

/**
 * Finds the step a given error field belongs to.
 * Used to jump back to the first step with an error.
 */
function findErrorStep(h: Errors): number | null {
  if (h.packageId) return 1;
  if (h.preferredDate || h.alternateDate || h.preferredTime) return 2;
  if (h.guestCount || h.weightRange) return 3;
  if (h.fullName || h.phone || h.email || h.locale) return 4;
  if (h.privacyConsent || h.explicitConsent || h.honeypot || h.turnstileToken) return 5;
  return null;
}

// Exported type kept for future use — currently for reference only
export type BookingOutput = z.output<typeof bookingSchema>;
