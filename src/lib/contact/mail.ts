/**
 * Contact form e-mail module.
 *
 * Forwards a message from the contact form to the admin by e-mail. It does NOT
 * write to the database — it is notification only.
 *
 * It shares the SMTP setup with `src/lib/booking/mail.ts` (smtpConfigured,
 * getTransporter, getFromAddress) and mirrors that module's sending model.
 * It keeps its own transporter rather than importing one, to avoid a circular
 * dependency.
 */

import nodemailer, { type Transporter } from 'nodemailer';
import { SITE } from '@/lib/site';

// --- Brand colours (matching the booking mail) ---
const COLOR = {
  navy: '#0B1F3A',
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
function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
  );
}

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

function getFromAddress(): string {
  return process.env.SMTP_FROM ?? process.env.SMTP_USER ?? `${BRAND_NAME} <no-reply@localhost>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlShell(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:${COLOR.greyBackground};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLOR.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.greyBackground};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${COLOR.white};border-radius:12px;overflow:hidden;border:1px solid ${COLOR.greyBorder};">
        <tr><td style="background:${COLOR.navy};padding:20px 24px;">
          <div style="font-size:16px;font-weight:700;color:${COLOR.white};">${BRAND_NAME}</div>
          <div style="font-size:12px;color:#94A3B8;margin-top:2px;">Contact form</div>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          ${contentHtml}
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid ${COLOR.greyBorder};background-color:${COLOR.greyBackground};">
          <p style="margin:0;font-size:12px;color:${COLOR.textHelper};line-height:1.5;">
            This e-mail was generated automatically. Please do not reply.
            ${SITE_URL ? `<br/>${escapeHtml(SITE_URL)}` : ''}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface ContactMailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface MailSendResult {
  sent: boolean;
  error?: string;
}

/**
 * Forwards a contact form message to the admin.
 * Falls back to the console when SMTP is absent (it never throws).
 */
export async function sendContactNotificationMail(
  data: ContactMailData
): Promise<MailSendResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('[contact-mail] ADMIN_EMAIL is not set — no notification was sent.');
    return { sent: false, error: 'ADMIN_EMAIL is not set' };
  }

  const t = transporterAl();
  if (!t) {
    console.warn(
      '[contact-mail] SMTP is not configured — no e-mail was sent (dev).'
    );
    return { sent: false, error: 'SMTP is not configured (dev)' };
  }

  const contentHtml = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${COLOR.navy};">New contact message</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${COLOR.text};">
      A new message came in through the contact form.
    </p>

    <div style="background:${COLOR.greyBackground};border:1px solid ${COLOR.greyBorder};border-radius:10px;padding:16px 20px;margin:20px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${COLOR.textHelper};width:25%;vertical-align:top;">Full name</td>
          <td style="padding:8px 0;font-size:14px;color:${COLOR.text};font-weight:500;vertical-align:top;">${escapeHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${COLOR.textHelper};vertical-align:top;">E-mail</td>
          <td style="padding:8px 0;font-size:14px;color:${COLOR.sky600};font-weight:500;vertical-align:top;">${escapeHtml(data.email)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${COLOR.textHelper};vertical-align:top;">Subject</td>
          <td style="padding:8px 0;font-size:14px;color:${COLOR.text};font-weight:500;vertical-align:top;">${escapeHtml(data.subject)}</td>
        </tr>
      </table>
    </div>

    <div style="margin:16px 0;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${COLOR.navy};text-transform:uppercase;letter-spacing:0.04em;">Message</p>
      <div style="background:${COLOR.white};border:1px solid ${COLOR.greyBorder};border-radius:10px;padding:16px 20px;font-size:14px;line-height:1.6;color:${COLOR.text};white-space:pre-wrap;">${escapeHtml(data.message)}</div>
    </div>
  `;

  const plainText = `New contact message\n\nFull name: ${data.name}\nE-mail: ${data.email}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`;

  try {
    await t.sendMail({
      from: getFromAddress(),
      to: adminEmail,
      // Reply-To is the visitor's address, so the admin can answer directly.
      replyTo: data.email,
      subject: `[${BRAND_NAME}] Contact: ${data.subject}`,
      html: htmlShell('New contact message', contentHtml),
      text: plainText,
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[contact-mail] Send failed:', message);
    return { sent: false, error: message };
  }
}
