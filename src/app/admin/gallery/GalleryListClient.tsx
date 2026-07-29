'use client';

/**
 * Gallery list manager (client).
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { GalleryForm, type GalleryData } from './GalleryForm';
import type { GalleryMedia } from '@prisma/client';

function displayFileName(url: string): string {
  try {
    const path = new URL(url, 'https://yerel.example').pathname;
    const name = path.split('/').filter(Boolean).at(-1);
    return name ? decodeURIComponent(name) : 'Media file';
  } catch {
    return 'Media file';
  }
}

function mediaName(g: GalleryMedia): string {
  return g.title?.trim() || displayFileName(g.url);
}

export function GalleryListClient({ gallery }: { gallery: GalleryMedia[] }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [edit, setEditing] = useState<GalleryData | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selectAllCheckbox = useRef<HTMLInputElement>(null);

  // A native checkbox's "indeterminate" state is not a prop and can only be
  // set through the DOM.
  useEffect(() => {
    if (!selectAllCheckbox.current) return;
    selectAllCheckbox.current.indeterminate =
      selected.size > 0 && selected.size < gallery.length;
  }, [selected, gallery.length]);

  function refresh() {
    setOpen(false);
    setEditing(null);
    window.location.reload();
  }

  function toggleSelection(id: string) {
    setSelected((previous) => {
      const fresh = new Set(previous);
      if (fresh.has(id)) {
        fresh.delete(id);
      } else {
        fresh.add(id);
      }
      return fresh;
    });
  }

  function toggleSelectAll() {
    setSelected((previous) =>
      previous.size === gallery.length ? new Set() : new Set(gallery.map((g) => g.id))
    );
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete the media "${title}"?`)) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.message ?? json.error ?? 'Silinemedi.');
      return;
    }
    refresh();
  }

  async function deleteSelected() {
    const num = selected.size;
    if (num === 0) return;
    if (!confirm(`Delete ${num} record(s)?`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/gallery/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(json.message ?? json.error ?? 'Silinemedi.');
        return;
      }
      refresh();
    } finally {
      setBulkDeleting(false);
    }
  }

  const columns: DataTableColumn<GalleryMedia>[] = [
    {
      // The header text is left blank; the "select all" box lives in its own bar
      // above (DataTable is shared, so it is not modified).
      header: '',
      cell: (g: GalleryMedia) => (
        <input
          type="checkbox"
          checked={selected.has(g.id)}
          onChange={() => toggleSelection(g.id)}
          aria-label={`Select ${mediaName(g)}`}
          className="h-4 w-4 rounded border-navy-300 text-sky-500 focus:ring-2 focus:ring-sky-400 cursor-pointer"
        />
      ),
      className: 'w-8',
    },
    {
      header: 'Preview',
      cell: (g: GalleryMedia) =>
        g.type === 'video' ? (
          <div className="flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-navy-100 bg-navy-50 text-navy-500">
            <Icon name="Video" className="h-5 w-5" aria-hidden="true" />
            <span className="text-[9px] font-medium leading-none">Video</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={g.url}
            alt={g.altText || g.title || ''}
            className="h-12 w-12 rounded-lg border border-navy-100 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ),
      className: 'w-16',
    },
    {
      header: 'Title / URL',
      cell: (g: GalleryMedia) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-navy-800">{mediaName(g)}</p>
        </div>
      ),
    },
    {
      header: '#',
      cell: (g: GalleryMedia) => <span className="text-navy-400">{g.sortOrder}</span>,
      className: 'w-10',
    },
    {
      header: 'Status',
      cell: (g: GalleryMedia) =>
        g.active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>,
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-navy-600">
          <input
            ref={selectAllCheckbox}
            type="checkbox"
            checked={gallery.length > 0 && selected.size === gallery.length}
            onChange={toggleSelectAll}
            disabled={gallery.length === 0}
            className="h-4 w-4 rounded border-navy-300 text-sky-500 focus:ring-2 focus:ring-sky-400 cursor-pointer"
          />
          Select all
        </label>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          size="sm"
        >
          + Yeni Media
        </Button>
      </div>

      {selected.size > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-sm font-medium text-red-800">
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={bulkDeleting}
            className="text-sm font-semibold text-red-700 hover:text-red-800 disabled:opacity-50"
          >
            {bulkDeleting ? 'Deleting…' : 'Delete selected'}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            disabled={bulkDeleting}
            className="text-sm font-medium text-navy-500 hover:text-navy-700 disabled:opacity-50"
          >
            Clear selection
          </button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={gallery}
        rowKey={(g) => g.id}
        actions={(g) => (
          <div className="flex gap-2">
            <button
              type="button"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
              onClick={() => {
                setEditing({
                  id: g.id,
                  url: g.url,
                  title: g.title ?? '',
                  altText: g.altText ?? '',
                  sortOrder: g.sortOrder,
                  active: g.active,
                  width: g.width,
                  height: g.height,
                  type: g.type,
                });
                setOpen(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:text-red-700"
              onClick={() => remove(g.id, mediaName(g))}
            >
              Delete
            </button>
          </div>
        )}
      />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={edit?.id ? 'Edit media' : 'New media'}
        sizeClassName="max-w-2xl"
      >
        <GalleryForm
          initial={edit}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSuccess={refresh}
        />
      </Modal>
    </>
  );
}
