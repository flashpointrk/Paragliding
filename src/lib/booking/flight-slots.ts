/**
 * Flight slot times and availability rules.
 *
 * There are two departures a day. A slot closes once fewer than
 * `CLOSING_MINUTES` remain, and the request rolls to the next slot — or to the
 * following day when none are left.
 *
 * Time is always computed in the business's own timezone (Europe/Istanbul), so
 * the answer is the same whether the server runs in UTC or the visitor sits in
 * another timezone.
 */

export const BUSINESS_TZ = 'Europe/Istanbul';

/** A slot can no longer be chosen once this many minutes remain. */
export const CLOSING_MINUTES = 30;

export interface Slot {
  /** Form value — "HH:MM". */
  value: string;
  /** Short label. */
  label: string;
  /** Display form ("09.00"). */
  hour: string;
  /** Minutes since the start of the day. */
  minutes: number;
}

export const FLIGHT_SLOTS: readonly Slot[] = [
  { value: '09:00', label: 'Morning', hour: '09.00', minutes: 9 * 60 },
  { value: '14:30', label: 'Afternoon', hour: '14.30', minutes: 14 * 60 + 30 },
] as const;

/** Today's date ("YYYY-MM-DD") and minute, in the business timezone. */
export function businessNow(now: Date = new Date()): {
  date: string;
  minutes: number;
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const al = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return {
    date: `${al('year')}-${al('month')}-${al('day')}`,
    // Some environments report 24:00 for midnight → normalise it to 0.
    minutes: (Number(al('hour')) % 24) * 60 + Number(al('minute')),
  };
}

/** Adds days to a "YYYY-MM-DD" date (calendar based, timezone free). */
export function addDays(date: string, day: number): string {
  const [y, a, g] = date.split('-').map(Number);
  const d = new Date(Date.UTC(y ?? 1970, (a ?? 1) - 1, g ?? 1));
  d.setUTCDate(d.getUTCDate() + day);
  return d.toISOString().slice(0, 10);
}

/** Is a slot on the given date still selectable? */
export function isSlotAvailable(
  date: string,
  slotMinutes: number,
  now: Date = new Date()
): boolean {
  const localNow = businessNow(now);
  if (date > localNow.date) return true; // a future day
  if (date < localNow.date) return false; // a past day
  return slotMinutes - localNow.minutes >= CLOSING_MINUTES;
}

/** The selectable slots on a given date. */
export function availableSlots(date: string, now: Date = new Date()): Slot[] {
  return FLIGHT_SLOTS.filter((s) => isSlotAvailable(date, s.minutes, now));
}

/** The earliest selectable date for a booking. */
export function earliestDate(now: Date = new Date()): string {
  const { date } = businessNow(now);
  return availableSlots(date, now).length > 0 ? date : addDays(date, 1);
}

/** The nearest selectable slot (date plus time). */
export function nearestSlot(now: Date = new Date()): {
  date: string;
  hour: string;
} {
  const date = earliestDate(now);
  const ilk = availableSlots(date, now)[0] ?? FLIGHT_SLOTS[0]!;
  return { date, hour: ilk.value };
}

/** "2026-07-25" → "25.07.2026" */
export function dateText(date: string): string {
  const [y, a, g] = date.split('-');
  return g && a && y ? `${g}.${a}.${y}` : date;
}
