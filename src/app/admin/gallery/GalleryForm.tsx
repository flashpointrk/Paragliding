'use client';

/**
 * Gallery media form (create/edit).
 *
 * - Edit mode: offers a simple single-file upload for optionally replacing the
 *   media of an existing record. The returned url/width/height/type are written
 *   into the form fields and the user confirms with "Update".
 * - Create mode: multi-file bulk upload is delegated to the `BulkUpload`
 *   component — each file creates its own gallery record directly, with an
 *   increasing sort order (see BulkUpload.tsx). The remaining fields on this
 *   form can still be used to add a single external media URL by hand.
 *
 * Video support: the media type ("image" | "video") is tracked in the `type`
 * field. Width and height cannot be computed on the server for video (no
 * ffmpeg), so the client reads them from a `<video>` element (see
 * video-dimensions.ts).
 */

import { useState, FormEvent, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { readVideoDimensions } from '@/lib/gallery/video-dimensions';
import { BulkUpload } from './BulkUpload';

export type GalleryMediaType = 'image' | 'video';

const TYPE_OPTIONS: { value: GalleryMediaType; label: string }[] = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

// The same limits as the upload route (src/app/api/admin/gallery/upload/route.ts)
// — checked on the client too, for fast early feedback.
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

interface UploadedFile {
  name: string;
  url: string;
  type: GalleryMediaType;
  width?: number;
  height?: number;
  size: number;
}

export interface GalleryData {
  id?: string;
  url: string;
  title: string;
  altText: string;
  sortOrder: number;
  active: boolean;
  width?: number | null;
  height?: number | null;
  type?: string;
}

interface Props {
  initial?: GalleryData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function GalleryForm({ initial, onClose, onSuccess }: Props) {
  const editMode = Boolean(initial?.id);

  const [url, setUrl] = useState(initial?.url ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [altText, setAltText] = useState(initial?.altText ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [width, setWidth] = useState<number | null>(initial?.width ?? null);
  const [height, setHeight] = useState<number | null>(initial?.height ?? null);
  const [type, setType] = useState<GalleryMediaType>(
    initial?.type === 'video' ? 'video' : 'image'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fileUploading, setFileUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // A simple single-file upload used only in edit mode: the returned
  // url/width/height/type are written into the form fields and the record is
  // confirmed manually with "Update" (see the module comment above).
  async function uploadFile(file: File) {
    const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
    if (!isImage && !isVideo) {
      setUploadError(`"${file.name}" is an unsupported file type.`);
      return;
    }
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      setUploadError(
        `"${file.name}" exceeds the ${isVideo ? '200 MB' : '25 MB'} limit.`
      );
      return;
    }

    setUploadError(null);
    setFileUploading(true);
    try {
      const form = new FormData();
      form.append('dosyalar', file);

      const res = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? 'Upload failed.');
      }

      const uploaded: UploadedFile | undefined = json.files?.[0];
      if (!uploaded) {
        throw new Error('Could not upload the file.');
      }

      setUrl(uploaded.url);
      // For a new upload the file name becomes the default visible title when one
      // has not been entered, so the list shows a name rather than a technical URL.
      if (!title.trim()) setTitle(uploaded.name);
      setType(uploaded.type);
      if (uploaded.type === 'video') {
        // The server cannot size a video (no ffmpeg) — the client reads it from
        // a <video> element, and leaves it empty when that fails (falling back
        // to a safe default).
        const size = await readVideoDimensions(uploaded.url);
        setWidth(size?.width ?? null);
        setHeight(size?.height ?? null);
      } else {
        setWidth(uploaded.width ?? null);
        setHeight(uploaded.height ?? null);
      }

      if (json.errors?.length) {
        setUploadError(json.errors[0]?.reason ?? 'Could not upload the file.');
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'An error occurred during the upload.'
      );
    } finally {
      setFileUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void uploadFile(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const payload = {
      url: url.trim(),
      title: title.trim() || null,
      altText: altText.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      active,
      type,
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
    };

    const url_ = initial?.id
      ? `/api/admin/gallery/${initial.id}`
      : '/api/admin/gallery';
    const method = initial?.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url_, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.message ?? json.error ?? 'Could not save.');
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
      {editMode ? (
        <div>
          <p className="mb-1.5 text-sm font-medium text-navy-800">
            Replace media (optional)
          </p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'rounded-xl border-2 border-dashed p-4 text-center transition-colors',
              dragging ? 'border-sky-400 bg-sky-50' : 'border-navy-200 bg-sand-50'
            )}
          >
            <p className="mb-2 text-xs text-navy-500">
              Drag and drop a new image or video, or choose one.
              Images are resized automatically and converted to webp; videos
              are stored as they are.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
              disabled={loading || fileUploading}
              onChange={onInputChange}
              className="block w-full text-sm text-navy-600 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
            />
            {fileUploading ? (
              <p className="mt-2 text-xs text-sky-600">Loading…</p>
            ) : null}
            {uploadError ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {uploadError}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <BulkUpload
          initialSortOrder={Number(sortOrder) || 0}
          onCompleted={onSuccess}
        />
      )}

      <Input
        label="Media URL"
        type="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          // Editing this by hand invalidates the dimensions from the previous upload.
          setWidth(null);
          setHeight(null);
        }}
        required
        disabled={loading}
        placeholder="https://… or upload above"
        hint="Filled automatically on upload; you can also enter a URL directly."
        error={errors.url}
      />
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        error={errors.title}
      />
      <Input
        label="Alt text"
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        disabled={loading}
        hint="Image description, for accessibility."
        error={errors.altText}
      />
      <Input
        label="Sort order"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        disabled={loading}
        hint="Lower values first"
        error={errors.sortOrder}
      />
      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value as GalleryMediaType)}
        disabled={loading}
        options={TYPE_OPTIONS}
        hint="Set automatically when you upload a file; choose it by hand for an external URL."
        error={errors.type}
      />
      <Checkbox
        label="Active"
        checked={active}
        onChange={(e) => setActive(e.target.checked)}
        disabled={loading}
      />

      {url ? (
        <div className="pt-1">
          <p className="mb-1 text-xs font-medium text-navy-500">Preview</p>
          {type === 'video' ? (
            <video
              src={url}
              className="h-24 w-24 rounded-lg border border-navy-100 object-cover"
              muted
              preload="metadata"
              controls
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={altText || title || 'Preview'}
              className="h-24 w-24 rounded-lg border border-navy-100 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {width && height ? (
            <p className="mt-1 text-xs text-navy-400">
              {width} × {height} px
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading || fileUploading}>
          {loading ? 'Saving…' : initial?.id ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
