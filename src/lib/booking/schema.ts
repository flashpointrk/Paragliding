import { z } from 'zod';
import { FLIGHT_SLOTS, CLOSING_MINUTES, isSlotAvailable } from './flight-slots';

/**
 * Zod schema for the booking (request) form.
 *
 * There is NO payment — this only records a request and triggers a
 * notification. The same schema runs on the client (step-by-step partial
 * validation) and on the server (API route).
 */

export const WEIGHT_RANGES = [
  '<50',
  '50-80',
  '80-100',
  '100-110',
  '110+',
  'specify',
] as const;

export const LOCALES = ['TR', 'EN'] as const;

export const MEDIA_PREFERENCES = ['none', 'photo', 'photo-video'] as const;

/**
 * Phone regex.
 * Accepted shapes: "+905XXXXXXXXX", "05XXXXXXXXX", "5XXXXXXXXX", optionally
 * with spaces (e.g. "05XX XXX XX XX"). The leading +90 or 0 is optional and is
 * followed by a 5 and nine more digits.
 */
export const PHONE_REGEX = /^(\+90|0)?\s*?5\d{2}\s*?\d{3}\s*?\d{2}\s*?\d{2}$/;

/** Preferred time: "HH:MM", or left empty. */
const preferredTime = z
  .string()
  .trim()
  .max(5, 'Time preference is too long')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .pipe(
    z
      .string()
      .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format (e.g. 10:30)')
      .optional()
  );

/**
 * Date helpers. The client's input[type=date] yields "YYYY-MM-DD", which the
 * server converts to a Date. Past dates are rejected.
 *
 * Note on the "later than today" rule — today itself is allowed; booking for
 * the same day is expected to go through the operations team.
 */
const dateString = z
  .string()
  .min(1, 'Please choose a date')
  .refine((v) => !Number.isNaN(new Date(v).getTime()), {
    message: 'Invalid date',
  });

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const futureDate = z
  .string()
  .min(1, 'Please choose a date')
  .refine((v) => !Number.isNaN(new Date(v).getTime()), {
    message: 'Invalid date',
  })
  // Today counts; only past dates are rejected.
  .refine((v) => new Date(v) >= startOfToday(), {
    message: 'You cannot choose a date in the past',
  });

/**
 * The booking form object schema (a plain ZodObject, so `.shape` is reachable).
 * The outer `.refine()` layer is applied in `bookingSchema`.
 *
 * Date fields are strings ("YYYY-MM-DD") on the client and converted to Date in
 * the API route.
 */
const bookingSchemaShape = z.object({
  packageId: z.string().min(1, 'Please choose a package'),

  preferredDate: futureDate,
  alternateDate: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(
      z
        .string()
        .refine((v) => !Number.isNaN(new Date(v).getTime()), {
          message: 'Invalid alternative date',
        })
        .refine((v) => new Date(v) > startOfToday(), {
          message: 'The alternative date must be after today',
        })
        .optional()
    ),
  preferredTime,

  guestCount: z.coerce
    .number({ invalid_type_error: 'Number of people is required' })
    .int('Number of people must be a whole number')
    .min(1, 'At least 1 person')
    .max(10, 'Up to 10 people (please call us for larger groups)'),

  weightRange: z.enum(WEIGHT_RANGES, {
    errorMap: () => ({ message: 'Please choose a weight range' }),
  }),

  fullName: z
    .string()
    .trim()
    .min(3, 'Your full name must be at least 3 characters')
    .max(100, 'Your full name is too long'),

  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(PHONE_REGEX, 'Please enter a valid mobile number (e.g. 05XX XXX XX XX)'),

  email: z
    .string()
    .trim()
    .min(1, 'E-mail address is required')
    .email('Please enter a valid e-mail address'),

  locale: z.enum(LOCALES, {
    errorMap: () => ({ message: 'Please choose a language' }),
  }),

  transferRequested: z.boolean().default(false),

  mediaPreference: z.enum(MEDIA_PREFERENCES, {
    errorMap: () => ({ message: 'Please choose a photo/video option' }),
  }),

  note: z
    .string()
    .trim()
    .max(500, 'Your note can be at most 500 characters')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.length > 0 ? v : undefined)),

  privacyConsent: z.boolean().refine((v) => v === true, {
    message: 'You must accept the privacy notice',
  }),

  explicitConsent: z.boolean().refine((v) => v === true, {
    message: 'You must accept the explicit consent statement',
  }),

  /**
   * Honeypot — spam protection. Real users never see or fill this field, so a
   * bot filling it in gets the request rejected.
   */
  honeypot: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || v.length === 0, {
      message: 'Spam tespit edildi',
    }),

  /**
   * Cloudflare Turnstile token (cf-turnstile-response).
   *
   * Optional at the schema level — Zod does not require it. The real check runs
   * server-side in verifyTurnstile(): when Turnstile is enabled, an empty token
   * or a failed siteverify rejects the request. When disabled the field is
   * ignored.
   */
  turnstileToken: z
    .string()
    .trim()
    .max(4096, 'Turnstile token is too long')
    .optional(),
});

/** Main booking form schema (object plus cross-field validation). */
export const bookingSchema = bookingSchemaShape
  .refine(
    (data) => {
      // The alternate date must differ from the preferred one (when both are set).
      if (data.alternateDate && data.preferredDate) {
        return new Date(data.alternateDate).getTime() !== new Date(data.preferredDate).getTime();
      }
      return true;
    },
    {
      message: 'The alternate date must differ from the preferred date',
      path: ['alternateDate'],
    }
  )
  .refine(
    (data) => {
      // A slot closing in less than CLOSING_MINUTES cannot be selected.
      // The client already blocks this; this layer is the last line of defence
      // against requests that call the API directly.
      if (!data.preferredTime || !data.preferredDate) return true;
      const slot = FLIGHT_SLOTS.find((s) => s.value === data.preferredTime);
      if (!slot) return true; // unknown time: the preferredTime format was already validated
      return isSlotAvailable(data.preferredDate, slot.minutes);
    },
    {
      message: `This departure closes ${CLOSING_MINUTES} minutes before take-off; please choose the next one`,
      path: ['preferredTime'],
    }
  );

/** Form type — for the client-side state. */
export type BookingFormData = z.input<typeof bookingSchema>;

/** The validated type sent to the API. */
export type BookingFormOutput = z.output<typeof bookingSchema>;

/**
 * Partial schemas for step-by-step validation.
 * Each step validates only its own fields; the full schema runs again on
 * submit.
 */
export const stepSchema = {
  1: z.object({ packageId: bookingSchemaShape.shape.packageId }),
  // Step 2: a past date or a closed slot blocks progress.
  2: z
    .object({
      preferredDate: futureDate,
      alternateDate: bookingSchemaShape.shape.alternateDate,
      preferredTime: bookingSchemaShape.shape.preferredTime,
    })
    .refine(
      (d) => {
        if (!d.preferredTime || !d.preferredDate) return true;
        const slot = FLIGHT_SLOTS.find((s) => s.value === d.preferredTime);
        return slot ? isSlotAvailable(d.preferredDate, slot.minutes) : true;
      },
      {
        message: `Less than ${CLOSING_MINUTES} minutes remain before this departure; please choose the next one`,
        path: ['preferredTime'],
      }
    ),
  3: z.object({
    guestCount: bookingSchemaShape.shape.guestCount,
    weightRange: bookingSchemaShape.shape.weightRange,
  }),
  4: z.object({
    fullName: bookingSchemaShape.shape.fullName,
    phone: bookingSchemaShape.shape.phone,
    email: bookingSchemaShape.shape.email,
    locale: bookingSchemaShape.shape.locale,
  }),
  5: z.object({
    privacyConsent: bookingSchemaShape.shape.privacyConsent,
    explicitConsent: bookingSchemaShape.shape.explicitConsent,
    honeypot: bookingSchemaShape.shape.honeypot,
  }),
} as const;

export const STEP_COUNT = 5;
