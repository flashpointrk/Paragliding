import { trBookingMail } from '@/messages/tr';
import nodemailer, { type Transporter } from 'nodemailer';
import type { Package, Booking } from '@prisma/client';
import { SITE } from '@/lib/site';

/**
 * Booking e-mail module.
 *
 * It sends two kinds of message:
 *  1) An acknowledgement to the customer — "we received your request; this is
 *     not a flight confirmation."
 *  2) A notification to the admin with the request details.
 *
 * SMTP environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
 *
 * Behaviour:
 *  - With SMTP unconfigured (no host) nothing is sent; the message is reported
 *    through console.error instead. That keeps the app from breaking in
 *    development, and the record is still written to the database.
 *  - SMTP is required in production (noted in the README).
 *  - The HTML templates use inline styles, for e-mail client compatibility.
 */

// --- Brand colours (aligned with the Tailwind palette) ---
const COLOR = {
  navy: '#0B1F3A',
  navy700: '#072F60',
  sky: '#0EA5E9',
  sky600: '#0284C7',
  greyBackground: '#F4F6FA',
  greyBorder: '#E2E8F0',
  text: '#1E293B',
  textHelper: '#64748B',
  white: '#FFFFFF',
} as const;

const BRAND_NAME = SITE.name;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? '';

let transporterCache: Transporter | null = null;

/** Reports whether the SMTP environment variables are set. */
export function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
  );
}

/**
 * The Nodemailer transporter (lazy, cached).
 * Returns null when the configuration is incomplete; the caller decides what to
 * do about it.
 */
function transporterAl(): Transporter | null {
  if (!smtpConfigured()) return null;
  if (transporterCache) return transporterCache;

  const port = Number(process.env.SMTP_PORT ?? '587');
  transporterCache = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return transporterCache;
}

/** Resolves the "From" address from the environment, falling back to the user. */
function getFromAddress(): string {
  return process.env.SMTP_FROM ?? process.env.SMTP_USER ?? `${BRAND_NAME} <no-reply@localhost>`;
}

// --- Locale ---

/**
 * The guest's e-mail is written in the locale chosen on the booking form
 * (`Booking.locale` = "TR" | "EN"). The admin notification is always in the
 * operator's own language, which is the default locale.
 */
type MailLocale = 'tr' | 'en';

function mailLocale(locale?: string | null): MailLocale {
  return String(locale).toUpperCase() === 'EN' ? 'en' : 'tr';
}

const EN_MAIL_TEXT = {
  htmlLang: 'en',
  tagline: 'Paragliding Experience',
  footer: 'This e-mail was generated automatically. Please do not reply.',
  title: 'We Have Received Your Request',
  subject: 'Your Flight Request Has Been Received',
  greetingBefore: (name: string) =>
    `Dear <strong>${name}</strong>, we have received your flight request.`,
  emphasis: 'This is not a flight confirmation.',
  greetingAfter:
    'Our team will contact you shortly to confirm the date, time and conditions together with you.',
  summaryTitle: 'Request Summary',
  pkg: 'Package',
  preferredDateValue: 'Preferred date',
  alternateDate: 'Alternative date',
  guestCount: 'Number of people',
  transfer: 'Transfer',
  transferYes: 'Yes, requested',
  mediaPreference: 'Photo / video',
  closing:
    'If you have any questions, reach us on WhatsApp or by phone. We will get back to you shortly.',
  media: { photo: 'Photos', photoVideo: 'Photos + video', none: 'None' },
};

/** Mail copy per locale; every non-default locale lives in `src/messages`. */
const MAIL_TEXT: Record<MailLocale, typeof EN_MAIL_TEXT> = {
  en: EN_MAIL_TEXT,
  tr: trBookingMail as unknown as typeof EN_MAIL_TEXT,
};

const INTL_LOCALE: Record<MailLocale, string> = { tr: 'tr-TR', en: 'en-GB' };

// --- Formatting helpers ---

function formatDate(d: Date, locale: MailLocale = 'en'): string {
  // tr-TR style: "24 Tem 2026" and similar
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(d));
  } catch {
    return new Date(d).toLocaleDateString();
  }
}

function mediaLabel(m?: string | null, locale: MailLocale = 'en'): string {
  const t = MAIL_TEXT[locale].media;
  switch (m) {
    case 'photo':
      return t.photo;
    case 'photo-video':
      return t.photoVideo;
    case 'none':
    default:
      return t.none;
  }
}

function weightLabel(k: string): string {
  switch (k) {
    case '<50':
      return 'under 50 kg';
    case '50-80':
      return '50–80 kg';
    case '80-100':
      return '80–100 kg';
    case '100-110':
      return '100–110 kg';
    case '110+':
      return 'over 110 kg';
    case 'specify':
      return 'will state it in the note';
    default:
      return k;
  }
}

/** Makes user-supplied text safe to embed in HTML. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- HTML iskelet ---

function htmlShell(
  title: string,
  contentHtml: string,
  locale: MailLocale = 'en'
): string {
  const t = MAIL_TEXT[locale];
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:${COLOR.greyBackground};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLOR.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.greyBackground};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${COLOR.white};border-radius:12px;overflow:hidden;border:1px solid ${COLOR.greyBorder};">
        <!-- Header band -->
        <tr><td style="background:${COLOR.navy};padding:20px 24px;">
          <div style="font-size:16px;font-weight:700;color:${COLOR.white};">${BRAND_NAME}</div>
          <div style="font-size:12px;color:#94A3B8;margin-top:2px;">${t.tagline}</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 24px;">
          ${contentHtml}
        </td></tr>
        <!-- Alt bilgi -->
        <tr><td style="padding:16px 24px;border-top:1px solid ${COLOR.greyBorder};background-color:${COLOR.greyBackground};">
          <p style="margin:0;font-size:12px;color:${COLOR.textHelper};line-height:1.5;">
            ${t.footer}
            ${SITE_URL ? `<br/>${escapeHtml(SITE_URL)}` : ''}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:${COLOR.textHelper};width:45%;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:${COLOR.text};font-weight:500;vertical-align:top;">${value}</td>
  </tr>`;
}

// --- Sending functions ---

export interface MailSendResult {
  sent: boolean;
  error?: string;
}

/**
 * Sends an e-mail, falling back to the console when SMTP is absent (it never
 * throws). The result is returned rather than raised, so the API route does not
 * tie the success of a database write to e-mail delivery.
 */
async function sendMail(
  recipient: string,
  subject: string,
  html: string,
  plainText: string
): Promise<MailSendResult> {
  const t = transporterAl();
  if (!t) {
    // Development: no SMTP — write to the console rather than throwing.
    console.warn(
      '[mail] SMTP is not configured — no e-mail was sent (dev). Recipient:',
      recipient,
      '| Konu:',
      subject
    );
    console.debug('[mail] Body (plain):\n', plainText);
    return { sent: false, error: 'SMTP is not configured (dev)' };
  }

  try {
    await t.sendMail({
      from: getFromAddress(),
      to: recipient,
      subject: subject,
      html,
      text: plainText,
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[mail] Send failed:', message);
    return { sent: false, error: message };
  }
}

/**
 * Sends the "request received" acknowledgement to the customer.
 *
 * Important: this is NOT a flight confirmation; it only reports that the
 * request arrived.
 */
export async function sendBookingReceivedMail(
  recipient: string,
  booking: Booking,
  pkg: Package
): Promise<MailSendResult> {
  const locale = mailLocale(booking.locale);
  const t = MAIL_TEXT[locale];
  const date = formatDate(booking.preferredDate, locale);
  const altDate = booking.alternateDate
    ? formatDate(booking.alternateDate, locale)
    : '—';
  const hour = booking.preferredTime ?? '—';
  // The package name follows the guest's locale too (falling back when empty).
  const packageName = locale === 'en' && pkg.nameTr ? pkg.nameTr : pkg.name;

  const contentHtml = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${COLOR.navy};">${t.title}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${COLOR.text};">
      ${t.greetingBefore(escapeHtml(booking.fullName))}
      <strong style="color:${COLOR.sky600};">${t.emphasis}</strong>
      ${t.greetingAfter}
    </p>

    <div style="background:${COLOR.greyBackground};border:1px solid ${COLOR.greyBorder};border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${COLOR.navy};text-transform:uppercase;letter-spacing:0.04em;">${t.summaryTitle}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRow(t.pkg, escapeHtml(packageName))}
        ${detailRow(t.preferredDateValue, `${date}${hour !== '—' ? ` · ${escapeHtml(hour)}` : ''}`)}
        ${detailRow(t.alternateDate, altDate)}
        ${detailRow(t.guestCount, String(booking.guestCount))}
        ${booking.transferRequested ? detailRow(t.transfer, t.transferYes) : ''}
        ${detailRow(t.mediaPreference, mediaLabel(booking.mediaPreference, locale))}
      </table>
    </div>

    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:${COLOR.textHelper};">
      ${t.closing}
    </p>
  `;

  const plainText = [
    t.title,
    '',
    `${t.greetingBefore(booking.fullName).replace(/<[^>]+>/g, '')} ${t.emphasis}`,
    '',
    `${t.pkg}: ${packageName}`,
    `${t.preferredDateValue}: ${date}${hour !== '—' ? ' ' + hour : ''}`,
    `${t.alternateDate}: ${altDate}`,
    `${t.guestCount}: ${booking.guestCount}`,
    '',
    t.greetingAfter,
  ].join('\n');

  return sendMail(
    recipient,
    `[${BRAND_NAME}] ${t.subject}`,
    htmlShell(t.title, contentHtml, locale),
    plainText
  );
}

/**
 * Sends the new-booking notification to the admin.
 * Recipient: the ADMIN_EMAIL environment variable.
 */
export async function sendAdminNotificationMail(
  booking: Booking,
  pkg: Package
): Promise<MailSendResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('[mail] ADMIN_EMAIL is not set — the admin notification was not sent.');
    return { sent: false, error: 'ADMIN_EMAIL is not set' };
  }

  const date = formatDate(booking.preferredDate);
  const altDate = booking.alternateDate ? formatDate(booking.alternateDate) : '—';
  const hour = booking.preferredTime ?? '—';

  const contentHtml = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${COLOR.navy};">New flight request</h1>
    <p style="margin:0 0 20px;font-size:14px;color:${COLOR.textHelper};">
      A new booking request came in. Status: <strong style="color:${COLOR.sky600};">PENDING</strong>
    </p>

    <div style="background:${COLOR.greyBackground};border:1px solid ${COLOR.greyBorder};border-radius:10px;padding:16px 20px;margin:20px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRow('Full name', escapeHtml(booking.fullName))}
        ${detailRow('Phone', escapeHtml(booking.phone))}
        ${detailRow('E-mail', escapeHtml(booking.email))}
        ${detailRow('Package', escapeHtml(pkg.name))}
        ${detailRow('Preferred date', `${date}${hour !== '—' ? ` · ${escapeHtml(hour)}` : ''}`)}
        ${detailRow('Alternate date', altDate)}
        ${detailRow('Guests', String(booking.guestCount))}
        ${detailRow('Weight range', weightLabel(booking.weightRange))}
        ${detailRow('Locale', booking.locale)}
        ${detailRow('Transfer', booking.transferRequested ? 'Yes' : 'No')}
        ${detailRow('Media preference', mediaLabel(booking.mediaPreference))}
        ${booking.note ? detailRow('Note', escapeHtml(booking.note)) : ''}
      </table>
    </div>

    <p style="margin:16px 0 0;font-size:14px;color:${COLOR.text};">
      Open the admin panel to handle the request.
    </p>
  `;

  const plainText = `New flight request\n\nName: ${booking.fullName}\nPhone: ${booking.phone}\nE-mail: ${booking.email}\nPackage: ${pkg.name}\nDate: ${date}${hour !== '—' ? ' ' + hour : ''}\nAlternate: ${altDate}\nGuests: ${booking.guestCount}\nWeight: ${booking.weightRange}\nTransfer: ${booking.transferRequested ? 'Yes' : 'No'}\nMedia: ${booking.mediaPreference}\n${booking.note ? 'Note: ' + booking.note : ''}`;

  return sendMail(
    adminEmail,
    `[${BRAND_NAME}] New request: ${booking.fullName} — ${date}`,
    htmlShell('New flight request', contentHtml),
    plainText
  );
}
