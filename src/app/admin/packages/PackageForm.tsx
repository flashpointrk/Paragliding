'use client';

/**
 * Package form (create/edit), used inside a modal.
 *
 * The content[] field uses a textarea (one item per line) and is split on
 * submit. Submit → POST/PUT /api/admin/packages[/id]. On success onSuccess
 * fires and the parent refreshes its list.
 */

import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

export interface PackageData {
  id?: string;
  name: string;
  nameTr?: string | null;
  description: string;
  descriptionTr?: string | null;
  content: string[];
  contentTr?: string[];
  showPrice: boolean;
  priceMin: number | null;
  sortOrder: number;
  active: boolean;
}

interface Props {
  initial?: PackageData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PackageForm({ initial, onClose, onSuccess }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [nameTr, setNameTr] = useState(initial?.nameTr ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [descriptionTr, setDescriptionTr] = useState(initial?.descriptionTr ?? '');
  const [contentTrText, setContentTrText] = useState(
    (initial?.contentTr ?? []).join('\n')
  );
  const [contentText, setContentText] = useState(
    (initial?.content ?? []).join('\n')
  );
  const [showPrice, setShowPrice] = useState(
    initial?.showPrice ?? false
  );
  const [priceMin, setPriceMin] = useState<string>(
    initial?.priceMin != null ? String(initial.priceMin) : ''
  );
  const [sortOrder, setSortOrder] = useState<string>(
    String(initial?.sortOrder ?? 0)
  );
  const [active, setActive] = useState(initial?.active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // The body scroll lock while the modal is open is handled in Modal.tsx.

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const payload = {
      name: name.trim(),
      nameTr: nameTr.trim() || null,
      description: description.trim(),
      descriptionTr: descriptionTr.trim() || null,
      contentTr: contentTrText
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      content: contentText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      showPrice,
      priceMin: priceMin.trim() ? Number(priceMin) : null,
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    const url = initial?.id
      ? `/api/admin/packages/${initial.id}`
      : '/api/admin/packages';
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
        label="Package name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
        error={errors.name}
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        disabled={loading}
        error={errors.description}
        rows={3}
      />
      <Input
        label="Package name (TR)"
        value={nameTr}
        onChange={(e) => setNameTr(e.target.value)}
        disabled={loading}
        hint="When empty, the Turkish page falls back to the default-locale text."
      />
      <Textarea
        label="Description (TR)"
        value={descriptionTr}
        onChange={(e) => setDescriptionTr(e.target.value)}
        disabled={loading}
        rows={3}
      />
      <Textarea
        label="Content (one item per line)"
        value={contentText}
        onChange={(e) => setContentText(e.target.value)}
        disabled={loading}
        rows={5}
        hint="E.g. Tandem flight, Insurance, Photo package…"
      />
      <Textarea
        label="Content — EN (one item per line)"
        value={contentTrText}
        onChange={(e) => setContentTrText(e.target.value)}
        disabled={loading}
        rows={5}
        hint="When empty, the Turkish page falls back to the default-locale items."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Sort order"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          disabled={loading}
          hint="Lower values first"
        />
        <Input
          label="Min. price (minor units)"
          type="number"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          disabled={loading}
          hint="e.g. 250000 = 2,500 TRY"
        />
        <div className="flex flex-col gap-2">
          <Checkbox
            label="Show the price"
            checked={showPrice}
            onChange={(e) => setShowPrice(e.target.checked)}
            disabled={loading}
          />
          <Checkbox
            label="Active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={loading}
          />
        </div>
      </div>

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
