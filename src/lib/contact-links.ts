/**
 * Small helpers for contact URLs.
 * Tolerant of missing or malformed input.
 */

/** Turns "+90 555 ..." into "tel:+90555...". */
export function tel(value: string): string {
  const digits = value.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

/** Turns "+90 555 ..." into "https://wa.me/90555...". */
export function wa(value: string, text?: string): string {
  const digits = value.replace(/[^\d]/g, '').replace(/^0/, '');
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
