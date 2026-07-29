'use client';

/**
 * Weather threshold form (create/edit). Covers every threshold field.
 */

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/admin/FormField';

export interface ThresholdData {
  id?: string;
  locationName: string;
  lat: number;
  lng: number;
  takeoffHeading: number;
  windMaxGreen: number;
  windMaxAmber: number;
  gustDeltaMaxGreen: number;
  gustDeltaMaxAmber: number;
  precipMaxGreen: number;
  precipMaxAmber: number;
  visibilityMinGreen: number;
  visibilityMinAmber: number;
  windSectorMin: number | null;
  windSectorMax: number | null;
  active: boolean;
}

interface Props {
  initial?: ThresholdData | null;
  onClose: () => void;
  onSuccess: () => void;
}

function num(v: string): number | null {
  const t = v.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function ThresholdForm({ initial, onClose, onSuccess }: Props) {
  const [f, setF] = useState({
    locationName: initial?.locationName ?? '',
    lat: String(initial?.lat ?? ''),
    lng: String(initial?.lng ?? ''),
    takeoffHeading: String(initial?.takeoffHeading ?? ''),
    windMaxGreen: String(initial?.windMaxGreen ?? ''),
    windMaxAmber: String(initial?.windMaxAmber ?? ''),
    gustDeltaMaxGreen: String(initial?.gustDeltaMaxGreen ?? ''),
    gustDeltaMaxAmber: String(initial?.gustDeltaMaxAmber ?? ''),
    precipMaxGreen: String(initial?.precipMaxGreen ?? ''),
    precipMaxAmber: String(initial?.precipMaxAmber ?? ''),
    visibilityMinGreen: String(initial?.visibilityMinGreen ?? ''),
    visibilityMinAmber: String(initial?.visibilityMinAmber ?? ''),
    windSectorMin: initial?.windSectorMin != null ? String(initial.windSectorMin) : '',
    windSectorMax: initial?.windSectorMax != null ? String(initial.windSectorMax) : '',
    active: initial?.active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((prev) => ({ ...prev, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const payload = {
      locationName: f.locationName.trim(),
      lat: Number(f.lat),
      lng: Number(f.lng),
      takeoffHeading: Number(f.takeoffHeading),
      windMaxGreen: Number(f.windMaxGreen),
      windMaxAmber: Number(f.windMaxAmber),
      gustDeltaMaxGreen: Number(f.gustDeltaMaxGreen),
      gustDeltaMaxAmber: Number(f.gustDeltaMaxAmber),
      precipMaxGreen: Number(f.precipMaxGreen),
      precipMaxAmber: Number(f.precipMaxAmber),
      visibilityMinGreen: Number(f.visibilityMinGreen),
      visibilityMinAmber: Number(f.visibilityMinAmber),
      windSectorMin: num(f.windSectorMin),
      windSectorMax: num(f.windSectorMax),
      active: f.active,
    };

    const url = initial?.id
      ? `/api/admin/weather-thresholds/${initial.id}`
      : '/api/admin/weather-thresholds';
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-3">
          <Input
            label="Location name"
            value={f.locationName}
            onChange={(e) => set('locationName', e.target.value)}
            required
            disabled={loading}
            error={errors.locationName}
          />
        </div>
        <Input
          label="Latitude (lat)"
          type="number"
          step="0.0001"
          value={f.lat}
          onChange={(e) => set('lat', e.target.value)}
          required
          disabled={loading}
          error={errors.lat}
        />
        <Input
          label="Longitude (lng)"
          type="number"
          step="0.0001"
          value={f.lng}
          onChange={(e) => set('lng', e.target.value)}
          required
          disabled={loading}
          error={errors.lng}
        />
        <Input
          label="Take-off heading (°)"
          type="number"
          step="1"
          value={f.takeoffHeading}
          onChange={(e) => set('takeoffHeading', e.target.value)}
          required
          disabled={loading}
          error={errors.takeoffHeading}
        />
      </div>

      <div className="rounded-lg bg-navy-50/50 p-3">
        <p className="text-xs font-semibold text-navy-600 mb-3">
          Green thresholds (ideal limit)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Wind max (km/h)" type="number" step="0.1" value={f.windMaxGreen} onChange={(e) => set('windMaxGreen', e.target.value)} disabled={loading} />
          <Input label="Gust delta max (km/h)" type="number" step="0.1" value={f.gustDeltaMaxGreen} onChange={(e) => set('gustDeltaMaxGreen', e.target.value)} disabled={loading} />
          <Input label="Precipitation max (mm)" type="number" step="0.1" value={f.precipMaxGreen} onChange={(e) => set('precipMaxGreen', e.target.value)} disabled={loading} />
          <Input label="Visibility min (km)" type="number" step="0.1" value={f.visibilityMinGreen} onChange={(e) => set('visibilityMinGreen', e.target.value)} disabled={loading} />
        </div>
      </div>

      <div className="rounded-lg bg-yellow-50/60 p-3">
        <p className="text-xs font-semibold text-navy-600 mb-3">
          Amber thresholds (caution limit)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Wind max (km/h)" type="number" step="0.1" value={f.windMaxAmber} onChange={(e) => set('windMaxAmber', e.target.value)} disabled={loading} />
          <Input label="Gust delta max (km/h)" type="number" step="0.1" value={f.gustDeltaMaxAmber} onChange={(e) => set('gustDeltaMaxAmber', e.target.value)} disabled={loading} />
          <Input label="Precipitation max (mm)" type="number" step="0.1" value={f.precipMaxAmber} onChange={(e) => set('precipMaxAmber', e.target.value)} disabled={loading} />
          <Input label="Visibility min (km)" type="number" step="0.1" value={f.visibilityMinAmber} onChange={(e) => set('visibilityMinAmber', e.target.value)} disabled={loading} />
        </div>
      </div>

      <FormField label="Wind direction sector (optional)" hint="Acceptable wind direction range in degrees. E.g. 300-60">
        <div className="grid grid-cols-2 gap-3">
          <Input type="number" placeholder="Min (e.g. 300)" value={f.windSectorMin} onChange={(e) => set('windSectorMin', e.target.value)} disabled={loading} />
          <Input type="number" placeholder="Max (e.g. 60)" value={f.windSectorMax} onChange={(e) => set('windSectorMax', e.target.value)} disabled={loading} />
        </div>
      </FormField>

      <Checkbox label="Active" checked={f.active} onChange={(e) => set('active', e.target.checked)} disabled={loading} />

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
