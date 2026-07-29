'use client';

/**
 * Pilot list manager (client).
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PilotForm, type PilotData } from './PilotForm';
import type { Pilot } from '@prisma/client';

export function PilotListClient({ pilots }: { pilots: Pilot[] }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [edit, setEditing] = useState<PilotData | null>(null);

  function refresh() {
    setOpen(false);
    setEditing(null);
    window.location.reload();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete the pilot "${name}"?`)) return;
    const res = await fetch(`/api/admin/pilots/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.message ?? 'Silinemedi.');
      return;
    }
    refresh();
  }

  const columns = [
    {
      header: 'Pilot',
      cell: (p: Pilot) => (
        <div className="flex items-center gap-3">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.photoUrl}
              alt={p.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-500 text-sm font-semibold">
              {p.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-navy-800">{p.name}</p>
            <p className="text-xs text-navy-400">{p.specialty}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Deneyim',
      cell: (p: Pilot) => <span className="text-navy-600">{p.experienceYears} yr</span>,
      className: 'hidden sm:table-cell',
    },
    {
      header: 'Languages',
      cell: (p: Pilot) => (
        <span className="text-navy-600">{p.languages.join(', ') || '—'}</span>
      ),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Status',
      cell: (p: Pilot) =>
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
          + New pilot
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={pilots}
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
                  specialty: p.specialty,
                  experienceYears: p.experienceYears,
                  licence: p.licence,
                  languages: p.languages,
                  photoUrl: p.photoUrl,
                  bio: p.bio,
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
        title={edit?.id ? 'Edit pilot' : 'New pilot'}
        sizeClassName="max-w-2xl"
      >
        <PilotForm
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
