/**
 * Admin layout (/admin/*).
 *
 * A server component. `requireStaff()` guards every admin page: without a
 * session, or without the ADMIN/OPERATOR role, it redirects to `/login`.
 *
 * Styling:
 *  - Subtle mesh background (sand tones)
 *  - Sidebar plus main-area grid
 *  - ScrollProgress is DISABLED for admin (via ScrollProgressAdminAware)
 *
 * Navigation comes from Sidebar.tsx (a client component), and the content sits
 * to the right of the sidebar on desktop.
 */

import { requireStaff } from '@/lib/admin-auth';
import { Sidebar } from '@/components/admin/Sidebar';

export const metadata = {
  title: 'Admin panel',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Requires ADMIN or OPERATOR; otherwise redirect('/login')
  const user = await requireStaff();

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundColor: '#FAFAF9',
        backgroundImage:
          'radial-gradient(at 10% 0%, rgb(245 158 11 / 0.04) 0px, transparent 50%), radial-gradient(at 90% 100%, rgb(14 165 233 / 0.04) 0px, transparent 50%)',
      }}
    >
      <Sidebar
        role={user.role}
        userName={user.name}
        userEmail={user.email}
      />
      <div className="lg:pl-64">
        <main className="relative min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
