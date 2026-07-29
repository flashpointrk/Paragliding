'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/admin/Modal';
import { cn } from '@/lib/utils';
import type { PageContentDefinition } from '@/lib/admin/page-content';

type Locale = 'tr' | 'en';
type JsonObject = Record<string, unknown>;

type SaveSummary = {
  id: string;
  slug: string;
  locale: string;
  active: boolean;
  updatedAt: Date | string;
};

type ApiResponse = {
  ok: boolean;
  definition: PageContentDefinition;
  record: {
    content: JsonObject;
    images: JsonObject;
    active: boolean;
  } | null;
  defaultContent: JsonObject;
  fallbackImages: Record<string, string>;
  message?: string;
};

type Media = {
  id: string;
  url: string;
  title: string | null;
  altText: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

interface Props {
  definitions: PageContentDefinition[];
  records: SaveSummary[];
}

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function arrayText(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join('\n');
}

function textToLines(value: string): string[] {
  return value
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean);
}

function setValue(source: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [ilk, ...remaining] = path;
  if (!ilk) return source;
  if (Array.isArray(source)) {
    const index = Number(ilk);
    const copy = [...source];
    copy[index] = setValue(copy[index], remaining, value);
    return copy;
  }
  const copy: JsonObject = isObject(source) ? { ...source } : {};
  copy[ilk] = setValue(copy[ilk], remaining, value);
  return copy;
}

function fieldLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('tr-TR'));
}

function mediaName(media: Pick<Media, 'url' | 'title'>): string {
  if (media.title?.trim()) return media.title.trim();
  try {
    const path = new URL(media.url, 'https://yerel.example').pathname;
    return decodeURIComponent(path.split('/').filter(Boolean).at(-1) ?? 'Media');
  } catch {
    return 'Media';
  }
}

function JsonEditor({
  value,
  path = [],
  onChange,
}: {
  value: unknown;
  path?: string[];
  onChange: (path: string[], value: unknown) => void;
}) {
  if (typeof value === 'string') {
    const long = value.length > 90 || value.includes('\n');
    const label = fieldLabel(path[path.length - 1] ?? 'Metin');
    return long ? (
      <Textarea
        label={label}
        value={value}
        rows={Math.min(8, Math.max(3, Math.ceil(value.length / 90)))}
        onChange={(e) => onChange(path, e.target.value)}
      />
    ) : (
      <Input label={label} value={value} onChange={(e) => onChange(path, e.target.value)} />
    );
  }

  if (Array.isArray(value)) {
    const textOnly = value.every((item) => typeof item === 'string');
    const label = fieldLabel(path[path.length - 1] ?? 'List');
    if (textOnly) {
      return (
        <Textarea
          label={label}
          value={arrayText(value)}
          rows={Math.min(9, Math.max(3, value.length + 1))}
          hint="Each line is saved as a separate list item."
          onChange={(e) => onChange(path, textToLines(e.target.value))}
        />
      );
    }

    return (
      <div className="space-y-3 rounded-lg border border-navy-100 p-4">
        <p className="text-sm font-semibold text-navy-800">{label}</p>
        {value.map((item, index) => (
          <JsonEditor
            key={`${path.join('.')}.${index}`}
            value={item}
            path={[...path, String(index)]}
            onChange={onChange}
          />
        ))}
      </div>
    );
  }

  if (isObject(value)) {
    const title = path.length ? fieldLabel(path[path.length - 1] ?? '') : null;
    return (
      <div className={cn('space-y-4', path.length ? 'rounded-lg border border-navy-100 p-4' : '')}>
        {title ? <p className="text-sm font-semibold text-navy-800">{title}</p> : null}
        {Object.entries(value).map(([key, subValue]) => (
          <JsonEditor
            key={[...path, key].join('.')}
            value={subValue}
            path={[...path, key]}
            onChange={onChange}
          />
        ))}
      </div>
    );
  }

  return null;
}

export function PageContentClient({ definitions, records }: Props) {
  const [slug, setSlug] = useState(definitions[0]?.slug ?? 'home');
  const [locale, setLocale] = useState<Locale>('en');
  const [content, setContent] = useState<JsonObject>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [mediaItems, setMedia] = useState<Media[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [selectorField, setSelectorField] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successful, setSucceeded] = useState(false);

  const definition = useMemo(
    () => definitions.find((item) => item.slug === slug) ?? definitions[0],
    [slug, definitions]
  );

  const recordKeys = useMemo(
    () => new Set(records.map((record) => `${record.slug}:${record.locale}`)),
    [records]
  );

  async function loadMediaList() {
    setMediaError(null);
    try {
      const res = await fetch('/api/admin/media');
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? json.error ?? 'Could not load the media list.');
      }
      setMedia(
        ((json.mediaItems ?? []) as Media[])
          .sort((a, b) => a.sortOrder - b.sortOrder)
      );
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Could not load the media list.');
    }
  }

  useEffect(() => {
    void loadMediaList();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function upload() {
      setLoading(true);
      setError(null);
      setSucceeded(false);
      try {
        const res = await fetch(`/api/admin/page-content?slug=${slug}&locale=${locale}`);
        const json = (await res.json()) as ApiResponse;
        if (!res.ok || !json.ok) {
          throw new Error(json.message ?? 'Could not load the content.');
        }
        if (cancelled) return;
        setContent(json.record?.content ?? json.defaultContent);
        setImages({
          ...json.fallbackImages,
          ...(json.record?.images as Record<string, string> | undefined),
        });
        setActive(json.record?.active ?? true);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the content.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void upload();
    return () => {
      cancelled = true;
    };
  }, [slug, locale]);

  function updateContent(path: string[], value: unknown) {
    setContent((previous) => setValue(previous, path, value) as JsonObject);
    setSucceeded(false);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSucceeded(false);

    try {
      const res = await fetch('/api/admin/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, locale, content, images, active }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? 'Could not save.');
      }
      setSucceeded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0 || mediaUploading) return;

    setMediaUploading(true);
    setMediaError(null);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Only images can be uploaded to the media library.');
        }
      }

      const form = new FormData();
      if (files.length > 6) {
        throw new Error('You can upload at most 6 images at a time.');
      }
      files.forEach((file) => form.append('dosyalar', file));
      const uploadResponse = await fetch('/api/admin/media', {
        method: 'POST',
        body: form,
      });
      const loadJson = await uploadResponse.json();
      if (!uploadResponse.ok || !loadJson.ok) {
        throw new Error(loadJson.error ?? loadJson.message ?? 'Could not upload the image.');
      }

      const newMedia = (loadJson.mediaItems ?? []) as Media[];
      setMedia((previous) => [...newMedia, ...previous]);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Could not upload the media.');
    } finally {
      setMediaUploading(false);
    }
  }

  function pickImage(alanKey: string, url: string) {
    setImages((previous) => ({ ...previous, [alanKey]: url }));
    setSelectorField(null);
    setSucceeded(false);
  }

  const selectorFieldDefinition = definition?.images.find((image) => image.key === selectorField);

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <aside className="space-y-2">
        {definitions.map((item) => {
          const selected = item.slug === slug;
          const trRecord = recordKeys.has(`${item.slug}:tr`);
          const recordLimit = recordKeys.has(`${item.slug}:en`);
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => setSlug(item.slug)}
              className={cn(
                'w-full rounded-lg border p-3 text-left transition-colors',
                selected
                  ? 'border-sky-300 bg-sky-50 text-navy-900'
                  : 'border-navy-100 bg-white text-navy-700 hover:border-sky-200'
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="flex gap-1">
                  {trRecord ? <Badge variant="green">TR</Badge> : null}
                  {recordLimit ? <Badge variant="blue">EN</Badge> : null}
                </span>
              </span>
              <span className="mt-1 block text-xs text-navy-500">{item.description}</span>
            </button>
          );
        })}
      </aside>

      <form onSubmit={save} className="space-y-5 rounded-lg border border-navy-100 bg-white p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_120px] md:items-end">
          <div>
            <h2 className="text-xl font-bold text-navy-900">{definition?.label}</h2>
            <p className="text-sm text-navy-500">{definition?.description}</p>
          </div>
          <Select
            label="Locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'tr', label: 'Turkish' },
            ]}
          />
          <div className="pb-2">
            <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {successful ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Content saved.
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-navy-500">Loading content…</p>
        ) : (
          <>
            <>
                {definition?.images.length ? (
                  <section className="space-y-3 rounded-lg border border-navy-100 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-navy-900">Page images</h3>
                      <p className="text-xs text-navy-500">
                        Images are chosen from the media library; no technical file path or key is shown.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {definition.images.map((image) => {
                        const selectedUrl = images[image.key] ?? image.fallback;
                        return (
                          <div
                            key={image.key}
                            className="overflow-hidden rounded-lg border border-navy-100 bg-white"
                          >
                            <div className="relative aspect-[16/9] bg-navy-50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(err) => {
                                  err.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="space-y-3 p-3">
                              <div>
                                <p className="text-sm font-semibold text-navy-900">{image.label}</p>
                                {image.description ? (
                                  <p className="mt-0.5 text-xs text-navy-500">{image.description}</p>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectorField(image.key)}
                                >
                                  Select media
                                </Button>
                                <button
                                  type="button"
                                  className="text-sm font-medium text-navy-500 hover:text-navy-800"
                                  onClick={() =>
                                    setImages((previous) => ({
                                      ...previous,
                                      [image.key]: image.fallback,
                                    }))
                                  }
                                >
                                  Use the default
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-navy-900">Texts</h3>
                  <JsonEditor value={content} onChange={updateContent} />
                </section>
              </>
          </>
        )}

        <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end border-t border-navy-100 bg-white/95 px-5 py-4 backdrop-blur">
          <Button type="submit" disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>

      <Modal
        open={Boolean(selectorField)}
        onClose={() => setSelectorField(null)}
        title={selectorFieldDefinition ? `Select media for ${selectorFieldDefinition.label}` : 'Select media'}
        sizeClassName="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-navy-500">
              Choose one of the images in the media library.
            </p>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-navy-200 px-4 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50">
              {mediaUploading ? 'Loading…' : 'Upload a new image'}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={mediaUploading}
                onChange={uploadMedia}
                className="sr-only"
              />
            </label>
          </div>
          {mediaError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {mediaError}
            </p>
          ) : null}
          {mediaItems.length > 0 ? (
            <div className="grid max-h-[65vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {mediaItems.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => selectorField && pickImage(selectorField, media.url)}
                  className="overflow-hidden rounded-lg border border-navy-100 bg-white text-left transition-colors hover:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span className="block aspect-[4/3] bg-navy-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.url}
                      alt={media.altText ?? media.title ?? ''}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="block truncate px-3 py-2 text-sm font-medium text-navy-700">
                    {mediaName(media)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-navy-200 p-6 text-center text-sm text-navy-500">
              Upload an image first.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
