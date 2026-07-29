'use client';

/**
 * Package list manager (client).
 *
 * Renders the `packages` list from the server; the "New" button opens a modal
 * (PackageForm), and each row carries edit and delete actions.
 *
 * This pattern — a client-side list manager — is used across every CRUD module.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PackageForm, type PackageData } from './PackageForm';
import type { Package } from '@prisma/client';

export function PackageListClient({ packages }: { packages: Package[] }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [edit, setEditing] = useState<PackageData | null>(null);
  const [, setVersion] = useState(0);

  function refresh() {
    setOpen(false);
    setEditing(null);
    // The simplest refresh: reload the page
    window.location.reload();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete the package "${name}"?`)) return;
    const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.message ?? 'Silinemedi.');
      return;
    }
    refresh();
  }

  const columns = [
    {
      header: 'Package',
      cell: (p: Package) => (
        <div>
          <p className="font-medium text-navy-800">{p.name}</p>
          <p className="text-xs text-navy-400 line-clamp-1">{p.description}</p>
        </div>
      ),
    },
    {
      header: 'Order',
      cell: (p: Package) => <span className="text-navy-600">{p.sortOrder}</span>,
      className: 'hidden sm:table-cell',
    },
    {
      header: 'Fiyat',
      cell: (p: Package) =>
        p.showPrice && p.priceMin != null ? (
          <span className="text-navy-600">
            {(p.priceMin / 100).toLocaleString('tr-TR')} ₺+
          </span>
        ) : (
          <span className="text-navy-300">—</span>
        ),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Status',
      cell: (p: Package) =>
        p.active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>,
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          size="sm"
        >
          + Yeni Package
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={packages}
        rowKey={(p) => p.id}
        actions={(p) => (
          <div className="flex gap-2">
            <button
              type="button"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
              onClick={() => {
                setEditing({
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  content: p.content,
                  showPrice: p.showPrice,
                  priceMin: p.priceMin,
                  sortOrder: p.sortOrder,
                  active: p.active,
                });
                setOpen(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:text-red-700"
              onClick={() => remove(p.id, p.name)}
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
        title={edit?.id ? 'Edit package' : 'New package'}
        sizeClassName="max-w-2xl"
      >
        <PackageForm
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
