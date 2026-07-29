'use client';

/**
 * Contact/settings form (client). Edits the ContactSettings "global" row.
 *
 * Receives the initial `settings` prop from the server. Submit → PUT
 * /api/admin/settings.
 *
 * Security:
 *  - turnstileSecret arrives MASKED in the API response (accompanied by the
 *    turnstileSecretSet boolean). The form only sends the secret when the admin
 *    clicks "Edit" and types a new value; otherwise it sends null and the
 *    server keeps the existing one.
 */

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ContactSettings } from '@prisma/client';

/** The API response masks the secret; this is the widened type. */
interface SettingsMask extends ContactSettings {
  turnstileSecretSet?: boolean;
}

interface Props {
  initial: SettingsMask | null;
}

export function SettingsForm({ initial }: Props): JSX.Element {
  const [f, setF] = useState({
    phone: initial?.phone ?? '',
    whatsapp: initial?.whatsapp ?? '',
    email: initial?.email ?? '',
    address: initial?.address ?? '',
    openingHours: initial?.openingHours ?? '',
    openingHoursTr: initial?.openingHoursTr ?? '',
    mapEmbed: initial?.mapEmbed ?? '',
    facebook: initial?.facebook ?? '',
    instagram: initial?.instagram ?? '',
    youtube: initial?.youtube ?? '',
    // Turnstile
    turnstileEnabled: initial?.turnstileEnabled ?? false,
    turnstileSiteKey: initial?.turnstileSiteKey ?? '',
    // Secret: absent from the API response (masked). Only the "is it set" flag.
    turnstileSecret: '',
  });

  // Has a secret been saved before? (drives the input placeholder)
  const secretSaved = initial?.turnstileSecretSet === true;
  // The secret cannot be edited until "Edit" is clicked (so it is never wiped).
  const [editSecret, setEditingSecret] = useState(false);
  // Is the secret field visible (password toggle)?
  const [showSecret, setShowSecret] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successful, setSucceeded] = useState(false);

  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((prev) => ({ ...prev, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});
    setSucceeded(false);

    // Turn empty strings into null (for the text fields other than Turnstile).
    const payload: Record<string, string | boolean | null> = {};
    for (const [k, v] of Object.entries(f)) {
      if (k === 'turnstileEnabled') {
        payload[k] = v as boolean;
      } else if (k === 'turnstileSecret') {
        // The secret is special: only send it after entering edit mode and typing.
        // Otherwise send null → the server keeps the existing secret.
        if (editSecret) {
          payload[k] = (v as string).trim() || null;
        } else {
          payload[k] = null; // koru sinyali
        }
      } else {
        payload[k] = typeof v === 'string' ? (v.trim() || null) : v;
      }
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        const firstError = json.errors ? Object.values(json.errors)[0] : null;
        throw new Error(firstError ?? json.error ?? json.message ?? 'Could not save.');
      }
      setSucceeded(true);
      // Leave secret edit mode after a successful save.
      setEditingSecret(false);
      setF((prev) => ({ ...prev, turnstileSecret: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone" value={f.phone} onChange={(e) => set('phone', e.target.value)} disabled={loading} error={errors.phone} placeholder="+90 ..." />
          <Input label="WhatsApp" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} disabled={loading} error={errors.whatsapp} placeholder="+90 ..." />
          <Input label="E-mail" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} disabled={loading} error={errors.email} />
          <Input label="Opening hours" value={f.openingHours} onChange={(e) => set('openingHours', e.target.value)} disabled={loading} />
          <Input label="Opening hours (TR)" value={f.openingHoursTr} onChange={(e) => set('openingHoursTr', e.target.value)} disabled={loading} hint="When empty, the Turkish page falls back to the default-locale text." />
          <div className="sm:col-span-2">
            <Textarea label="Address" value={f.address} onChange={(e) => set('address', e.target.value)} disabled={loading} rows={2} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Google Maps Embed URL" value={f.mapEmbed} onChange={(e) => set('mapEmbed', e.target.value)} disabled={loading} rows={3} hint="Google Maps → Share → Embed a map link" error={errors.mapEmbed} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Facebook" value={f.facebook} onChange={(e) => set('facebook', e.target.value)} disabled={loading} placeholder="https://..." error={errors.facebook} />
          <Input label="Instagram" value={f.instagram} onChange={(e) => set('instagram', e.target.value)} disabled={loading} placeholder="https://..." error={errors.instagram} />
          <Input label="YouTube" value={f.youtube} onChange={(e) => set('youtube', e.target.value)} disabled={loading} placeholder="https://..." error={errors.youtube} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bot protection (Cloudflare Turnstile)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-navy-500">
            Create a widget from the Cloudflare dashboard &gt; Turnstile.{' '}
            The <strong>site key</strong> is public (it is used in the client),
            while the <strong>secret key</strong> is server-side only and is
            never returned in a response. Once enabled, the booking and contact
            forms ask for bot verification.
          </p>

          <Checkbox
            label="Enable Turnstile bot protection"
            checked={f.turnstileEnabled}
            onChange={(e) => set('turnstileEnabled', e.target.checked)}
            disabled={loading}
          />

          <Input
            label="Site key (public)"
            value={f.turnstileSiteKey}
            onChange={(e) => set('turnstileSiteKey', e.target.value)}
            disabled={loading}
            placeholder="0x4AAAAAAA..."
            error={errors.turnstileSiteKey}
            hint="Site key for the Cloudflare Turnstile widget."
          />

          {/* Secret key — a password field, unlocked with "Edit". */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="turnstileSecret" className="text-sm font-medium text-navy-800">
              Hidden Key (secret)
            </label>
            {!editSecret ? (
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-full items-center rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-700">
                  {secretSaved ? (
                    <span>
                      <span className="font-medium text-green-700">Saved</span>{' '}
                      <span className="text-navy-400">(hidden for security)</span>
                    </span>
                  ) : (
                    <span className="text-navy-400">Not set yet</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSecret(true);
                    setShowSecret(false);
                    setF((prev) => ({ ...prev, turnstileSecret: '' }));
                  }}
                  disabled={loading}
                >
                  Edit
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  id="turnstileSecret"
                  type={showSecret ? 'text' : 'password'}
                  autoComplete="off"
                  value={f.turnstileSecret}
                  onChange={(e) => set('turnstileSecret', e.target.value)}
                  disabled={loading}
                  placeholder="New secret key…"
                  className="h-11 w-full rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  aria-describedby="turnstileSecret-hint"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecret((s) => !s)}
                  disabled={loading}
                >
                  {showSecret ? 'Hide' : 'Show'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingSecret(false);
                    setF((prev) => ({ ...prev, turnstileSecret: '' }));
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            )}
            {errors.turnstileSecret ? (
              <p className="text-xs text-red-600">{errors.turnstileSecret}</p>
            ) : (
              <p id="turnstileSecret-hint" className="text-xs text-navy-500">
                {editSecret
                  ? 'Leaving this empty clears the stored key. Enter a new value to save one.'
                  : 'Choose “Edit” only to change it; the stored key is otherwise preserved.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {successful ? (
        <p className="text-sm text-green-600" role="status">
          Settings saved.
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="md" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
