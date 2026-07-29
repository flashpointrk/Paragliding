'use client';

/**
 * Contact form (client component) — the "Open Sky" design language.
 *
 * A plain, editorial look:
 *  - Flat white card (Card) with a hairline border and a subtle shadow
 *  - The standard Input/Textarea components (floatingLabel)
 *  - Turnstile inside a plain card
 *  - Success screen: a simple check icon plus a short fade-up (Reveal)
 *
 * Security (unchanged):
 *  - Honeypot field (hidden; bots fill it in)
 *  - Turnstile token (required when enabled)
 *  - CSRF is handled server-side through Origin/Referer, so the client needs
 *    nothing
 */

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Turnstile } from '@/components/ui/Turnstile';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/motion/Reveal';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { translateError, translateErrors } from '@/lib/i18n/errors';

export interface ContactFormProps {
  /** Cloudflare Turnstile public site key. No widget is shown when empty. */
  turnstileSiteKey?: string | null;
}

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  bosphorus: string; // honeypot
};

type Errors = Partial<Record<keyof FormState | 'turnstileToken', string>>;

type SubmitState =
  | { status: 'bos' }
  | { status: 'gonderiliyor' }
  | { status: 'successful' }
  | { status: 'hata'; message: string };

function bosForm(): FormState {
  return { name: '', email: '', subject: '', message: '', bosphorus: '' };
}

export function ContactForm({
  turnstileSiteKey,
}: ContactFormProps): JSX.Element {
  const { s: sz, locale } = useDictionary();
  const f = sz.contact.form;
  const [form, setForm] = React.useState<FormState>(bosForm);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submit, setSubmit] = React.useState<SubmitState>({ status: 'bos' });
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(
    null
  );

  const turnstileEnabled = Boolean(turnstileSiteKey && turnstileSiteKey.length > 0);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submit.status === 'gonderiliyor') return;

    // Turnstile aktifse token zorunlu.
    if (turnstileEnabled && !turnstileToken) {
      setErrors({ turnstileToken: f.completeVerification });
      return;
    }

    setErrors({});
    setSubmit({ status: 'gonderiliyor' });

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          turnstileToken: turnstileEnabled ? turnstileToken : undefined,
        }),
      });
      const data = (await resp.json()) as {
        ok: boolean;
        errors?: Record<string, string>;
        message?: string;
      };

      if (resp.ok && data.ok) {
        setSubmit({ status: 'successful' });
        setForm(bosForm());
        setTurnstileToken(null);
        return;
      }

      if (data.errors) {
        setErrors(translateErrors(locale, data.errors) as Errors);
      }
      setSubmit({
        status: 'hata',
        message: data.message ? translateError(locale, data.message) : f.generalError,
      });
    } catch {
      setSubmit({
        status: 'hata',
        message:
          f.errorConnection,
      });
    }
  }

  // --- Success screen — a simple check icon plus a short fade-up ---
  if (submit.status === 'successful') {
    return (
      <Reveal y={12}>
        <Card
          variant="default"
          className="flex flex-col items-center gap-4 p-8 text-center"
        >
          <div
            role="status"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600"
          >
            <Icon name="CheckCircle2" className="h-9 w-9" aria-hidden="true" />
          </div>

          <h3 className="font-display text-xl font-semibold text-navy-900">
            {f.successTitle}
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-navy-600">
            {f.successText}
          </p>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setSubmit({ status: 'bos' })}
          >
            {f.newMessage}
          </Button>
        </Card>
      </Reveal>
    );
  }

  const submitting = submit.status === 'gonderiliyor';

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-sand-200 bg-white p-6 shadow-soft"
      aria-label={f.formLabel}
    >
      {/* Genel hata */}
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
          <p className="text-sm font-medium text-red-800">{submit.message}</p>
        </div>
      ) : null}

      <Input
        label={f.labelName}
        required
        autoComplete="name"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={errors.name}
        disabled={submitting}
        placeholder={f.labelName}
        floatingLabel
      />

      <Input
        label={f.emailLabel}
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        error={errors.email}
        disabled={submitting}
        placeholder={f.emailHint}
        floatingLabel
      />

      <Input
        label={f.subjectLabel}
        required
        value={form.subject}
        onChange={(e) => updateField('subject', e.target.value)}
        error={errors.subject}
        disabled={submitting}
        placeholder={f.subjectHint}
        floatingLabel
      />

      <Textarea
        label={f.messageLabel}
        required
        rows={5}
        value={form.message}
        onChange={(e) => updateField('message', e.target.value)}
        error={errors.message}
        disabled={submitting}
        placeholder={f.messageHint}
      />

      {/* Cloudflare Turnstile bot protection (when enabled) */}
      {turnstileEnabled ? (
        <Card variant="muted" className="p-4">
          <Turnstile
            siteKey={turnstileSiteKey!}
            onToken={setTurnstileToken}
            error={errors.turnstileToken}
          />
        </Card>
      ) : null}

      {/* Honeypot — visually hidden, filled in by bots */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="bosphorus">{sz.common.honeypot}</label>
        <input
          id="bosphorus"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.bosphorus}
          onChange={(e) => updateField('bosphorus', e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={submitting}
        disabled={submitting || (turnstileEnabled && !turnstileToken)}
        title={
          turnstileEnabled && !turnstileToken
            ? f.completeVerification
            : undefined
        }
        className="w-full gap-2"
      >
        <Icon name="Send" className="h-4 w-4" aria-hidden="true" />
        {submitting
          ? f.submitting
          : turnstileEnabled && !turnstileToken
            ? f.awaitingVerification
            : sz.common.send}
      </Button>
    </form>
  );
}
