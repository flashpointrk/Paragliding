'use client';

/**
 * Bulk gallery upload — drag and drop hundreds of files at once.
 *
 * `GalleryForm.tsx` uses this component in create mode (edit mode keeps its own
 * simple single-file flow).
 *
 * The flow:
 *  1. Client-side pre-check (type/size) — invalid files go straight to the
 *     error list and are never sent to the server.
 *  2. Valid files are split into batches of at most 6 files and 200 MB; at most
 *     two batches are posted to `/api/admin/gallery/upload` concurrently, so
 *     neither the server nor its memory is overwhelmed.
 *  3. Each successfully uploaded file gets a record created through
 *     `/api/admin/gallery`. That step runs in its own SEQUENTIAL queue —
 *     batches are processed concurrently, but records are created one by one.
 *  4. The server does not report width/height for video files, so the client
 *     reads them from a `<video>` element just before creating the record.
 *  5. When everything finishes a summary and error report is shown, and it
 *     stays on screen until the user dismisses it (see `isDone`) — it never
 *     auto-closes or refreshes.
 *
 * Cancelling: `AbortController` stops the requests in flight, and batches or
 * record-creation steps that never started are added to the error list with the
 * reason "Cancelled", so the summary counts always add up.
 */

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { readVideoDimensions } from '@/lib/gallery/video-dimensions';
import { cn } from '@/lib/utils';

// Mirrors the limits in src/app/api/admin/gallery/upload/route.ts.
const BATCH_SIZE = 6;
const CONCURRENT_BATCH = 2;
// The server/NGINX accepts 250 MB; leaving room for the multipart headers we
// keep the client batch payload at 200 MB.
const MAX_BATCH_REQUEST_BYTES = 200 * 1024 * 1024;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);
const ACCEPTED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

interface UploadedFile {
  name: string;
  url: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  size: number;
}

interface FailureRecord {
  name: string;
  reason: string;
}

interface QueueState {
  running: boolean;
  isDone: boolean;
  total: number;
  completed: number;
  successCount: number;
  currentLabel: string | null;
  errors: FailureRecord[];
}

const EMPTY_STATE: QueueState = {
  running: false,
  isDone: false,
  total: 0,
  completed: 0,
  successCount: 0,
  currentLabel: null,
  errors: [],
};

export interface BulkUploadProps {
  initialSortOrder: number;
  /** Called when the user dismisses the final report, so the list can refresh. */
  onCompleted: () => void;
}

function chunkFiles(files: File[]): File[][] {
  const result: File[][] = [];
  let batch: File[] = [];
  let batchBytes = 0;

  for (const file of files) {
    const needsNewBatch =
      batch.length > 0 &&
      (batch.length >= BATCH_SIZE || batchBytes + file.size > MAX_BATCH_REQUEST_BYTES);

    if (needsNewBatch) {
      result.push(batch);
      batch = [];
      batchBytes = 0;
    }

    batch.push(file);
    batchBytes += file.size;
  }

  if (batch.length > 0) result.push(batch);
  return result;
}

/** Client-side pre-check — a reason string when invalid, null when fine. */
function preflightReason(file: File): string | null {
  if (file.size <= 0) return 'The file is empty.';
  const isImage = ACCEPTED_IMAGE_TYPES.has(file.type);
  const isVideo = ACCEPTED_VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) return 'Unsupported file type.';
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return `The file exceeds the ${isVideo ? '200 MB' : '25 MB'} limit.`;
  }
  return null;
}

function buildLabel(batch: File[]): string {
  if (batch.length === 1) return batch[0]?.name ?? '';
  return `Uploading ${batch.length} file(s), starting with ${batch[0]?.name ?? ''}`;
}

export function BulkUpload({
  initialSortOrder,
  onCompleted,
}: BulkUploadProps) {
  const [status, setStatus] = useState<QueueState>(EMPTY_STATE);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  // Held in a ref because button and event handlers need it: React state
  // updates are asynchronous, and the running queue loop has to see the
  // latest value immediately.
  const cancelRef = useRef(false);
  const controllerlarRef = useRef<Set<AbortController>>(new Set());

  // Warn before leaving the page while an upload is running.
  useEffect(() => {
    if (!status.running) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [status.running]);

  /** Records one or more errors into the counters and the list. */
  function markFailures(records: FailureRecord[]) {
    if (records.length === 0) return;
    setStatus((previous) => ({
      ...previous,
      completed: previous.completed + records.length,
      errors: [...previous.errors, ...records],
    }));
  }

  function markCancelled(batch: File[]) {
    markFailures(
      batch.map((d) => ({ name: d.name || 'isimsiz', reason: 'Cancelled.' }))
    );
  }

  async function start(files: File[]) {
    if (files.length === 0 || status.running) return;

    cancelRef.current = false;
    controllerlarRef.current.clear();

    // 1) Client pre-check — invalid files go straight to the error list.
    const validOnes: File[] = [];
    const preflightFailures: FailureRecord[] = [];
    for (const file of files) {
      const reason = preflightReason(file);
      if (reason) preflightFailures.push({ name: file.name || 'isimsiz', reason });
      else validOnes.push(file);
    }

    setStatus({
      running: true,
      isDone: false,
      total: files.length,
      completed: preflightFailures.length,
      successCount: 0,
      currentLabel: validOnes.length > 0 ? 'Preparing…' : null,
      errors: preflightFailures,
    });

    if (validOnes.length === 0) {
      setStatus((previous) => ({ ...previous, running: false, isDone: true }));
      return;
    }

    // Record-creation queue — batches run concurrently, but this chain always
    // waits for the previous entry to finish (strictly sequential).
    let recordQueue: Promise<void> = Promise.resolve();
    let sortCounter = initialSortOrder;

    async function createRecord(file: UploadedFile) {
      if (cancelRef.current) {
        markFailures([{ name: file.name, reason: 'Cancelled.' }]);
        return;
      }

      setStatus((previous) => ({ ...previous, currentLabel: `Saving ${file.name}…` }));

      let width = file.width;
      let height = file.height;
      if (file.type === 'video' && (!width || !height)) {
        const size = await readVideoDimensions(file.url);
        width = size?.width;
        height = size?.height;
      }

      const controller = new AbortController();
      controllerlarRef.current.add(controller);

      try {
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: file.url,
            title: file.name,
            sortOrder: sortCounter,
            active: true,
            type: file.type,
            ...(width ? { width } : {}),
            ...(height ? { height } : {}),
          }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? 'Could not create the record.');
        }
        sortCounter += 1;
        setStatus((previous) => ({
          ...previous,
          completed: previous.completed + 1,
          successCount: previous.successCount + 1,
        }));
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === 'AbortError'
            ? 'Cancelled.'
            : err instanceof Error
              ? err.message
              : 'Could not create the record.';
        markFailures([{ name: file.name, reason: message }]);
      } finally {
        controllerlarRef.current.delete(controller);
      }
    }

    async function processBatch(batch: File[]) {
      if (cancelRef.current) {
        markCancelled(batch);
        return;
      }

      setStatus((previous) => ({ ...previous, currentLabel: buildLabel(batch) }));

      const controller = new AbortController();
      controllerlarRef.current.add(controller);

      let successful: UploadedFile[] = [];
      let serverErrors: FailureRecord[] = [];

      try {
        const form = new FormData();
        batch.forEach((d) => form.append('dosyalar', d));
        const res = await fetch('/api/admin/gallery/upload', {
          method: 'POST',
          body: form,
          signal: controller.signal,
        });
        // If a reverse proxy or CDN rejects the request before it reaches the app
        // (a 413, say), the response may be HTML rather than JSON. Rather than
        // spreading the raw browser message from a failed `res.json()` across
        // hundreds of files, show one comprehensible upload error.
        let json: {
          files?: UploadedFile[];
          errors?: FailureRecord[];
          error?: string;
        } | null = null;
        try {
          json = await res.json();
        } catch {
          const generalReason =
            res.status === 413
              ? 'The upload exceeded the size limit set by the server. Try again in smaller batches.'
              : `Invalid response from the server (HTTP ${res.status}).`;
          serverErrors = batch.map((d) => ({
            name: d.name || 'isimsiz',
            reason: generalReason,
          }));
          return;
        }
        successful = json?.files ?? [];
        serverErrors = json?.errors ?? [];
        if (!res.ok && successful.length === 0 && serverErrors.length === 0) {
          // The whole batch was rejected (auth/CSRF/body error) — attach the general
          // message to every file in the batch as its reason.
          const generalReason = json?.error ?? 'Upload failed.';
          serverErrors = batch.map((d) => ({ name: d.name || 'isimsiz', reason: generalReason }));
        }
      } catch (err) {
        controllerlarRef.current.delete(controller);
        if (cancelRef.current || (err instanceof DOMException && err.name === 'AbortError')) {
          markCancelled(batch);
          return;
        }
        const message =
          err instanceof Error ? err.message : 'A network error occurred during the upload.';
        serverErrors = batch.map((d) => ({ name: d.name || 'isimsiz', reason: message }));
        successful = [];
      }
      controllerlarRef.current.delete(controller);

      markFailures(serverErrors);

      // Queue record creation for the uploaded files — not awaited here, so the
      // worker can move on to the next batch immediately.
      for (const file of successful) {
        recordQueue = recordQueue.then(() => createRecord(file));
      }
    }

    const batches = chunkFiles(validOnes);
    let nextIndex = 0;

    async function worker() {
      while (!cancelRef.current) {
        const i = nextIndex;
        nextIndex += 1;
        if (i >= batches.length) return;
        const batch = batches[i];
        if (batch) await processBatch(batch);
      }
    }

    const workerCount = Math.min(CONCURRENT_BATCH, batches.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    // After a cancellation some batches may never have been queued at all.
    if (cancelRef.current && nextIndex < batches.length) {
      markCancelled(batches.slice(nextIndex).flat());
    }

    // Wait for every queued record-creation step to finish.
    await recordQueue;

    setStatus((previous) => ({ ...previous, running: false, currentLabel: null, isDone: true }));
  }

  function cancel() {
    cancelRef.current = true;
    controllerlarRef.current.forEach((c) => c.abort());
    controllerlarRef.current.clear();
  }

  async function copyList() {
    const text = status.errors.map((h) => `${h.name} — ${h.reason}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/browser support) — ignore silently.
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (status.running) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length > 0) void start(files);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length > 0) void start(files);
  }

  const percent =
    status.total > 0 ? Math.round((status.completed / status.total) * 100) : 0;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-navy-800">
        Upload images / video (multiple allowed)
      </p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!status.running) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-xl border-2 border-dashed p-4 text-center transition-colors',
          dragging ? 'border-sky-400 bg-sky-50' : 'border-navy-200 bg-sand-50',
          status.running && 'opacity-70'
        )}
      >
        <p className="mb-2 text-xs text-navy-500">
          Drag and drop images and videos here, or choose them — hundreds of
          files at once. Each file automatically becomes its own gallery record,
          in increasing sort order.
        </p>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={status.running}
          onChange={onInputChange}
          className="block w-full text-sm text-navy-600 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50"
        />
      </div>

      {status.running ? (
        <div className="mt-3 space-y-2 rounded-xl border border-navy-100 bg-white p-3">
          <div className="flex items-center justify-between text-xs font-medium text-navy-600">
            <span>
              {status.completed}/{status.total} file
            </span>
            <span>%{percent}</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-navy-100"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-200 ease-smooth"
              style={{ width: `${percent}%` }}
            />
          </div>
          {status.currentLabel ? (
            <p className="truncate text-xs text-navy-400">{status.currentLabel}</p>
          ) : null}
          <button
            type="button"
            onClick={cancel}
            className="text-xs font-semibold text-red-600 hover:text-red-700"
          >
            Cancel
          </button>
        </div>
      ) : null}

      {status.isDone ? (
        <div className="mt-3 space-y-3 rounded-xl border border-navy-100 bg-white p-3" role="status">
          <p className="text-sm font-medium text-navy-800">
            {status.successCount} file(s) uploaded, {status.errors.length}
            failed.
          </p>
          {status.errors.length > 0 ? (
            <>
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-red-100 bg-red-50/50">
                <ul className="divide-y divide-red-100 text-xs">
                  {status.errors.map((h, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 px-3 py-2">
                      <span className="break-all font-medium text-navy-700">{h.name}</span>
                      <span className="flex-none text-right text-red-700">{h.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => void copyList()}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                {copied ? 'Copied ✓' : 'Copy list'}
              </button>
            </>
          ) : null}
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={onCompleted}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
