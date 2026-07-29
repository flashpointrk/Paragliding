'use client';

/**
 * FAQ list manager (client).
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { FaqForm, type FaqData } from './FaqForm';
import type { Faq } from '@prisma/client';

export function FaqListClient({ faq }: { faq: Faq[] }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [edit, setEditing] = useState<FaqData | null>(null);

  function refresh() {
    setOpen(false);
    setEditing(null);
    window.location.reload();
  }

  async function remove(id: string, question: string) {
    if (!confirm(`Delete the question "${question}"?`)) return;
    const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.message ?? 'Silinemedi.');
      return;
    }
    refresh();
  }

  const columns = [
    {
      header: '#',
      cell: (s: Faq) => <span className="text-navy-400">{s.sortOrder}</span>,
      className: 'w-10',
    },
    {
      header: 'Question',
      cell: (s: Faq) => (
        <div>
          <p className="font-medium text-navy-800">{s.question}</p>
          <p className="text-xs text-navy-400 line-clamp-2">{s.answer}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (s: Faq) =>
        s.active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>,
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
          + New question
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={faq}
        rowKey={(s) => s.id}
        actions={(s) => (
          <div className="flex gap-2">
            <button
              type="button"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
              onClick={() => {
                setEditing({
                  id: s.id,
                  question: s.question,
                  answer: s.answer,
                  sortOrder: s.sortOrder,
                  active: s.active,
                });
                setOpen(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:text-red-700"
              onClick={() => remove(s.id, s.question)}
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
        title={edit?.id ? 'Edit question' : 'New question'}
        sizeClassName="max-w-2xl"
      >
        <FaqForm
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
