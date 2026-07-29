'use client';

import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

type Media = {
  id: string;
  url: string;
  title: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  active: boolean;
  sortOrder: number;
  createdAt: Date | string;
};

function mediaName(media: Pick<Media, 'title' | 'url'>): string {
  if (media.title?.trim()) return media.title.trim();
  return 'Untitled image';
}

export function MediaLibraryClient({ initialMedia }: { initialMedia: Media[] }) {
  const [mediaItems, setMedia] = useState(initialMedia);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0 || loading) return;

    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      files.forEach((file) => form.append('dosyalar', file));
      const res = await fetch('/api/admin/media', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? json.error ?? 'Could not upload the image.');
      setMedia((previous) => [...(json.mediaItems as Media[]), ...previous]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the image.');
    } finally {
      setLoading(false);
    }
  }

  async function remove(media: Media) {
    if (!confirm(`Remove “${mediaName(media)}” from the media library?`)) return;
    setDeletingId(media.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media/${media.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? json.error ?? 'Could not delete the image.');
      setMedia((previous) => previous.filter((item) => item.id !== media.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the image.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-navy-100 pb-4 sm:flex-row sm:items-center">
        <p className="text-sm text-navy-600">{mediaItems.length} image(s)</p>
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
          <Icon name="Plus" className="h-4 w-4" aria-hidden="true" />
          {loading ? 'Loading…' : 'Upload image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={loading}
            onChange={upload}
            className="sr-only"
          />
        </label>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {mediaItems.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mediaItems.map((media) => (
            <figure key={media.id} className="overflow-hidden rounded-lg border border-navy-100 bg-white">
              <div className="relative aspect-[4/3] bg-navy-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt={media.altText ?? media.title ?? ''}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="flex items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy-700">
                  {mediaName(media)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete the image ${mediaName(media)}`}
                  title="Delete image"
                  disabled={deletingId === media.id}
                  onClick={() => void remove(media)}
                  className="h-8 w-8 shrink-0 px-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Icon name="X" className="h-4 w-4" aria-hidden="true" />
                </Button>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-navy-200 p-8 text-center text-sm text-navy-500">
          The media library is empty.
        </p>
      )}
    </section>
  );
}
