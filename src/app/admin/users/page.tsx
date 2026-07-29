/**
 * User management (/admin/users). ADMIN ONLY.
 *
 * A server component, with requireAdmin() as an additional guard.
 */

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { UserListClient, type UserRow } from './UserListClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  const rows: UserRow[] = users.map((k) => ({
    ...k,
    createdAt: k.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Users</h1>
        <p className="text-sm text-navy-500">
          Manage the admin panel users (ADMIN only).
        </p>
      </div>
      <UserListClient
        users={rows}
        currentUserId={user.id}
      />
    </div>
  );
}
