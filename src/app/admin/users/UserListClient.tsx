'use client';

/**
 * User list manager (client).
 *
 * - New user (modal)
 * - Role change (select → PUT)
 * - Delete (DELETE; deleting yourself is blocked in the API)
 *
 * `currentUserId` is the session user's id, used to hide the delete button on
 * your own row.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { UserForm } from './UserForm';
import type { Role } from '@prisma/client';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

interface Props {
  users: UserRow[];
  currentUserId: string;
}

export function UserListClient({
  users,
  currentUserId,
}: Props): JSX.Element {
  const [open, setOpen] = useState(false);

  function refresh() {
    setOpen(false);
    window.location.reload();
  }

  async function changeRole(id: string, rol: Role) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: rol }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.message ?? 'Could not update the role.');
      return;
    }
    refresh();
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Delete the user "${email}"?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json.message ?? 'Silinemedi.');
      return;
    }
    refresh();
  }

  const columns = [
    {
      header: 'User',
      cell: (k: UserRow) => (
        <div>
          <p className="font-medium text-navy-800">
            {k.name}
            {k.id === currentUserId ? (
              <span className="ml-2 text-xs text-sky-600">(siz)</span>
            ) : null}
          </p>
          <p className="text-xs text-navy-400">{k.email}</p>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (k: UserRow) =>
        k.role === 'ADMIN' ? (
          <Badge variant="green">ADMIN</Badge>
        ) : (
          <Badge variant="gray">OPERATOR</Badge>
        ),
      className: 'hidden sm:table-cell',
    },
    {
      header: 'Change role',
      cell: (k: UserRow) => (
        <select
          aria-label={`Change the role for ${k.name}`}
          value={k.role}
          onChange={(e) => changeRole(k.id, e.target.value as Role)}
          className="h-9 rounded-lg border border-navy-200 bg-white px-2 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="OPERATOR">OPERATOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      ),
      className: 'hidden md:table-cell',
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)} size="sm">
          + New user
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(k) => k.id}
        actions={(k) =>
          k.id === currentUserId ? (
            <span className="text-xs text-navy-300">—</span>
          ) : (
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:text-red-700"
              onClick={() => remove(k.id, k.email)}
            >
              Delete
            </button>
          )
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New user"
        sizeClassName="max-w-lg"
      >
        <UserForm onClose={() => setOpen(false)} onSuccess={refresh} />
      </Modal>
    </>
  );
}
