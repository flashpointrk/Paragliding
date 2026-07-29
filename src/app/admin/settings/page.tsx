/**
 * Contact / settings (/admin/settings).
 *
 * A server component. Loads the ContactSettings "global" row and passes it to
 * the form.
 */

import { prisma } from '@/lib/prisma';
import { SettingsForm } from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await prisma.contactSettings.findUnique({
    where: { id: 'global' },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Contact / settings
        </h1>
        <p className="text-sm text-navy-500">
          Site-wide contact details and social links.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
