/**
 * BookingStatus → coloured Badge mapping.
 *
 * PENDING   = amber (an optional pulse for live data)
 * CONFIRMED = green
 * POSTPONED = blue (the 'blue' Badge)
 * CANCELLED = red
 * COMPLETED = grey
 *
 * Usable as a server component (it holds no state).
 */

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { BookingStatus } from '@prisma/client';

const LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  POSTPONED: 'Postponed',
  CANCELLED: 'Cancel',
  COMPLETED: 'Completed',
};

const VARIANT: Record<BookingStatus, BadgeVariant> = {
  PENDING: 'yellow',
  CONFIRMED: 'green',
  POSTPONED: 'blue',
  CANCELLED: 'red',
  COMPLETED: 'gray',
};

export interface StatusBadgeProps {
  status: BookingStatus;
  /**
   * Pulse-ring animation for live-data badges.
   * Recommended for states that want attention, such as pending bookings.
   */
  pulse?: boolean;
}

export function StatusBadge({ status, pulse = false }: StatusBadgeProps): JSX.Element {
  return (
    <Badge variant={VARIANT[status] ?? 'gray'} pulse={pulse}>
      {LABEL[status] ?? String(status)}
    </Badge>
  );
}

export { LABEL as STATUS_LABEL };
