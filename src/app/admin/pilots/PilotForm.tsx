'use client';

/**
 * Pilot form (create/edit).
 *
 * languages[] uses a textarea, one language code per line (TR, EN and so on).
 */

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

export interface PilotData {
  id?: string;
  name: string;
  specialty: string;
  specialtyTr?: string | null;
  experienceYears: number;
  licence: string | null;
  languages: string[];
  photoUrl: string | null;
  bio: string;
  bioTr?: string | null;
  active: boolean;
}

interface Props {
  initial?: PilotData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PilotForm({ initial, onClose, onSuccess }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [specialty, setSpecialty] = useState(initial?.specialty ?? '');
  const [specialtyTr, setSpecialtyTr] = useState(initial?.specialtyTr ?? '');
  const [experienceYears, setExperienceYears] = useState(
    String(initial?.experienceYears ?? 0)
  );
  const [licence, setLicence] = useState(initial?.licence ?? '');
  const [languagesText, setLanguagesText] = useState(
    (initial?.languages ?? []).join(', ')
  );
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
  const [bioTr, setBioTr] = useState(initial?.bioTr ?? '');
  const [active, setActive] = useState(initial?.active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const payload = {
      name: name.trim(),
      specialty: specialty.trim(),
      specialtyTr: specialtyTr.trim() || null,
      experienceYears: Number(experienceYears) || 0,
      licence: licence.trim() || null,
      languages: languagesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      photoUrl: photoUrl.trim() || null,
      bio: bio.trim(),
      bioTr: bioTr.trim() || null,
      active,
    };

    const url = initial?.id
      ? `/api/admin/pilots/${initial.id}`
      : '/api/admin/pilots';
    const method = initial?.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.message ?? 'Could not save.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
        error={errors.name}
      />
      <Input
        label="Specialty"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
        required
        disabled={loading}
        placeholder="Tandem pilot"
        error={errors.specialty}
      />
      <Input
        label="Specialty (TR)"
        value={specialtyTr}
        onChange={(e) => setSpecialtyTr(e.target.value)}
        disabled={loading}
        hint="When empty, the Turkish page falls back to the default-locale bio."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Experience (years)"
          type="number"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          disabled={loading}
        />
        <Input
          label="Licence / certificate"
          value={licence}
          onChange={(e) => setLicence(e.target.value)}
          disabled={loading}
          hint="opsiyonel"
        />
      </div>
      <Input
        label="Languages"
        value={languagesText}
        onChange={(e) => setLanguagesText(e.target.value)}
        disabled={loading}
        placeholder="TR, EN"
        hint="Comma separated"
      />
      <Input
        label="Photo URL"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        disabled={loading}
        placeholder="https://..."
        hint="opsiyonel"
        error={errors.photoUrl}
      />
      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        required
        disabled={loading}
        rows={4}
        error={errors.bio}
      />
      <Textarea
        label="Bio (TR)"
        value={bioTr}
        onChange={(e) => setBioTr(e.target.value)}
        disabled={loading}
        rows={4}
        hint="When empty, the Turkish page falls back to the default-locale bio."
      />
      <Checkbox
        label="Active"
        checked={active}
        onChange={(e) => setActive(e.target.checked)}
        disabled={loading}
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Saving…' : initial?.id ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
