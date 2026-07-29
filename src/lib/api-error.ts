/**
 * Central API error handling.
 *
 * Security goals:
 *  - A stack trace, SQL, Prisma internals or a file path must never reach
 *    the client.
 *  - In production server errors collapse to a generic message; the detail
 *    only goes to the server-side log.
 *  - PII (e-mail, phone, password) is never written to the log.
 *  - Every API uses the same response shape:
 *      { ok: false, error: "message", code?: "CODE" }
 *
 * Note: for convenience `error.message` may reach the client while
 * NODE_ENV !== 'production'. That is switched off in production.
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

const IS_PROD = process.env.NODE_ENV === 'production';

/** Shared shape of every error response body. */
export interface ApiErrorBody {
  ok: false;
  error: string;
  code?: string;
}

/**
 * Returns a safe, localized error message to the client.
 * Carries no stack or internal detail.
 *
 * @param message  Message to show the client.
 * @param status   HTTP status code (defaults to 400).
 * @param code     Optional machine-readable error code.
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { ok: false, error: message };
  if (code) body.code = code;
  return NextResponse.json(body, { status: status });
}

/**
 * Turns a Zod validation failure into a per-field message map and answers
 * 422 (Unprocessable Entity). Schema internals are not leaked — only the
 * field messages that are safe to show the user.
 */
export function apiValidationError(
  issues: Array<{ path: PropertyKey[]; message: string }>
): NextResponse {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? '_');
    if (!errors[field]) errors[field] = issue.message;
  }
  return NextResponse.json(
    { ok: false, errors, error: 'Please check the form.' },
    { status: 422 }
  );
}

// =====================================================
// PII FILTERING
// =====================================================

/** Field names treated as PII and stripped from logs (lower-case). */
const PII_KEYS = new Set<string>([
  'email',
  'e-mail',
  'eposta',
  'phone',
  'phone',
  'sifre',
  'password',
  'passwordhash',
  'passwordconfirm',
  'token',
  'authorization',
  'cookie',
  'adsoyad',
  'name',
  'not',
  'note',
  'address',
  'address',
]);

/**
 * Replaces e-mail/phone-like PII inside a string with "[REDACTED_*]". Used to
 * censor values embedded in the string form of error objects (error.message,
 * stack).
 */
function redactPiiString(s: string): string {
  if (typeof s !== 'string') return s;
  // E-posta desenleri
  let out = s.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[REDACTED_EMAIL]'
  );
  // Turkish phone patterns (+90, leading 0, ten digits)
  out = out.replace(
    /(?:\+?90[\s-]?)?(?:0)?\s?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g,
    '[REDACTED_PHONE]'
  );
  return out;
}

/**
 * Deep-copies an object (usually an error/log context) while masking keys that
 * hold PII with "[REDACTED]". Circular references are broken safely.
 */
function redactPiiValue(
  value: unknown,
  seen: WeakSet<object> = new WeakSet()
): unknown {
  // null/primitive
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string') return redactPiiString(value);
    return value;
  }

  // Circular-reference guard
  if (seen.has(value as object)) {
    return '[Circular]';
  }
  seen.add(value as object);

  // Dizi
  if (Array.isArray(value)) {
    return value.map((v) => redactPiiValue(v, seen));
  }

  // Error object: keep only name and message (the stack is handled separately)
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactPiiString(value.message),
    };
  }

  // Genel nesne
  const result: Record<string, unknown> = {};
  const source = value as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    if (PII_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactPiiValue(source[key], seen);
    }
  }
  return result;
}

// =====================================================
// YAPISAL LOG (guvenliLog)
// =====================================================

export type LogLevel = 'error' | 'warn' | 'info';

/**
 * PII-filtered, levelled, structured and safe logging.
 *
 * The stack trace goes to the server console ONLY — it never reaches an HTTP
 * response. E-mail/phone/password values are masked automatically.
 *
 * @param context  Which module/endpoint? (e.g. "api/booking")
 * @param error    Error object or message; may be unknown.
 * @param extra    Optional extra context (passed through the PII filter).
 * @param level    Log level (defaults to 'error').
 */
export function safeLog(
  context: string,
  error: unknown,
  ekVeri?: Record<string, unknown>,
  level: LogLevel = 'error'
): void {
  const stamp = new Date().toISOString();
  let message = '';
  let stack: string | undefined;

  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    try {
      message = JSON.stringify(error);
    } catch {
      message = String(error);
    }
  }

  // Strip the PII
  const cleanMessage = redactPiiString(message);
  const cleanStack = stack ? redactPiiString(stack) : undefined;
  const cleanSuffix = ekVeri ? redactPiiValue(ekVeri) : undefined;

  const record = {
    level,
    time: stamp,
    context,
    message: cleanMessage,
    ...(cleanSuffix ? { data: cleanSuffix } : {}),
  };

  const fn =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : console.info;
  fn(JSON.stringify(record));
  // Write the stack on its own line (PII filtered) — server side only.
  if (cleanStack && level === 'error') {
    fn(`[${context}] stack: ${cleanStack}`);
  }
}

// =====================================================
// PRISMA ERROR MAPPING
// =====================================================

/**
 * Maps Prisma `PrismaClientKnownRequestError` codes onto safe messages and
 * matching HTTP statuses. Unknown codes fall back to a generic message.
 * Returns null when the error is not a Prisma error, so the caller can answer
 * with a generic server error.
 *
 * Codes that matter:
 *  - P2002: unique constraint violation (already exists)
 *  - P2025: record not found (update/delete/findUniqueOrFail)
 *  - P2003: foreign key violation (a dependent record exists)
 */
export function mapPrismaError(
  error: unknown
): { message: string; status: number; code: string } | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }
  switch (error.code) {
    case 'P2002':
      return {
        message: 'This record already exists.',
        status: 409,
        code: 'ALREADY_EXISTS',
      };
    case 'P2025':
      return {
        message: 'The record was not found.',
        status: 404,
        code: 'NOT_FOUND',
      };
    case 'P2003':
      return {
        message: 'This cannot be done while related records exist.',
        status: 409,
        code: 'RELATION_CONSTRAINT',
      };
    default:
      return {
        message: 'The database operation failed.',
        status: 500,
        code: 'DB_ERROR',
      };
  }
}

/**
 * Converts an unknown error into a safe API response.
 *
 * Production: a generic message (500); the detail goes to the log.
 * Development: `error.message` may be surfaced to ease debugging.
 *
 * Prisma errors are mapped onto a suitable message/status automatically.
 *
 * @param error    The caught error.
 * @param context  Which endpoint/module? Used for the log.
 * @param extra    Optional log context (passed through the PII filter).
 */
export function apiServerError(
  error: unknown,
  context: string,
  ekVeri?: Record<string, unknown>
): NextResponse<ApiErrorBody> {
  // Is this a known Prisma error?
  const matched = mapPrismaError(error);
  if (matched) {
    // These are expected, user-driven cases: log them at warn rather than
    // error level — still passed through the PII filter.
    safeLog(context, error, ekVeri, 'warn');
    return apiError(matched.message, matched.status, matched.code);
  }

  // Unexpected server error — log the full detail, answer generically.
  safeLog(context, error, ekVeri, 'error');

  if (IS_PROD) {
    return apiError(
      'Something went wrong. Please try again.',
      500,
      'SERVER_ERROR'
    );
  }

  // Development: surface the message (never the stack)
  const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
  return apiError(message, 500, 'SERVER_ERROR');
}

// =====================================================
// REQUEST BODY SIZE CHECK
// =====================================================

/** Result of the generic size check. */
export interface SizeCheckResult {
  /** Within the allowed limit? */
  valid: boolean;
  /** Bytes read (Content-Length or an actual read). */
  size: number;
  /** The limit in bytes when exceeded; undefined otherwise. */
  limit?: number;
}

/**
 * Cheap size check straight from the Content-Length header when that can be
 * trusted, without reading the body. With no header the body is read as bytes
 * (which consumes the stream — prefer `checkBodySize` in that case).
 *
 * @param request   Next.js Request.
 * @param maxBytes  Maximum allowed bytes (defaults to 100KB).
 */
export async function sizeCheck(
  request: Request,
  maxBytes: number = 100 * 1024
): Promise<SizeCheckResult> {
  const cl = request.headers.get('content-length');
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n >= 0) {
      if (n > maxBytes) {
        return { valid: false, size: n, limit: maxBytes };
      }
      return { valid: true, size: n };
    }
  }
  // No Content-Length: read the body as bytes (consumes the stream).
  // NOTE: the caller then cannot call req.json() again, which is why
  // POST/PUT handlers should prefer checkBodySize.
  try {
    const buf = await request.arrayBuffer();
    const n = buf.byteLength;
    if (n > maxBytes) {
      return { valid: false, size: n, limit: maxBytes };
    }
    return { valid: true, size: n };
  } catch {
    // Unreadable means the size is unknown — err on the safe side and reject.
    return { valid: false, size: 0, limit: maxBytes };
  }
}

/** govdeKontrolu sonucu. */
export interface BodyCheckResult<T> {
  /** Is the size/format valid? */
  valid: boolean;
  /** Ready-made error response when invalid; undefined otherwise. */
  response?: NextResponse;
  /** Successfully parsed body. */
  data?: T;
}

/**
 * One step: check the size, then parse the body as JSON. Answers 413 when the
 * limit is exceeded and 400 for invalid JSON.
 *
 * This collapses the repeated try/catch plus size check in POST/PUT route
 * handlers into a single line and keeps the error format consistent.
 *
 * @param request   Next.js Request.
 * @param maxBytes  Maximum allowed bytes.
 * @returns { valid: false, response } or { valid: true, data }.
 */
export async function checkBodySize<T = unknown>(
  request: Request,
  maxBytes: number = 100 * 1024
): Promise<BodyCheckResult<T>> {
  // Fast path first: check Content-Length without consuming the stream.
  const cl = request.headers.get('content-length');
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > maxBytes) {
      return {
        valid: false,
        response: apiError(
          'The submitted data is too large. Please send a smaller payload.',
          413,
          'PAYLOAD_TOO_LARGE'
        ),
      };
    }
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return {
      valid: false,
      response: apiError('Invalid request body.', 400, 'INVALID_BODY'),
    };
  }

  // After the stream is consumed check the real size (this catches a missing
  // or misleading Content-Length).
  const naturalSize = Buffer.byteLength(text, 'utf8');
  if (naturalSize > maxBytes) {
    return {
      valid: false,
      response: apiError(
        'The submitted data is too large. Please send a smaller payload.',
        413,
        'PAYLOAD_TOO_LARGE'
      ),
    };
  }

  // JSON parse
  if (text.length === 0) {
    return {
      valid: false,
      response: apiError('The request body is empty.', 400, 'EMPTY_BODY'),
    };
  }

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    return {
      valid: false,
      response: apiError('Invalid JSON format.', 400, 'INVALID_JSON'),
    };
  }

  return { valid: true, data };
}
