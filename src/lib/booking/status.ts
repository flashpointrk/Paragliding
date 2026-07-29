import type { BookingStatus } from '@prisma/client';

const TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'POSTPONED', 'CANCELLED'],
  CONFIRMED: ['POSTPONED', 'CANCELLED', 'COMPLETED'],
  POSTPONED: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
};

/** The same status is never rewritten, and terminal statuses cannot be undone. */
export function isBookingStatusTransitionAllowed(
  existing: BookingStatus,
  target: BookingStatus
): boolean {
  return TRANSITIONS[existing].includes(target);
}

export function allowedTransitions(
  existing: BookingStatus
): readonly BookingStatus[] {
  return TRANSITIONS[existing];
}
