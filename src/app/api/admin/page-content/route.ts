/**
 * /api/admin/page-content
 *
 * GET – the managed content for the selected page and locale.
 * PUT – save the text and image overrides for that page and locale.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiRequireStaff } from '@/lib/admin-auth';
import {
  apiError,
  apiServerError,
  apiValidationError,
  checkBodySize,
} from '@/lib/api-error';
import {
  pageContentDefinition,
  fallbackImages,
  defaultPageContent,
  type AnyPageContentSlug,
} from '@/lib/admin/page-content';
import { isValidLocale, type Locale } from '@/lib/i18n/locales';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 300 * 1024;

const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValue),
    z.record(jsonValue),
  ])
);

const saveSchema = z.object({
  slug: z.string().trim().min(1),
  locale: z.enum(['tr', 'en']),
  content: z.record(jsonValue),
  images: z.record(z.string().trim().max(500)).default({}),
  active: z.boolean().default(true),
});

function searchParams(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug') ?? '';
  const locale = url.searchParams.get('locale') ?? 'tr';
  return { slug, locale };
}

export async function GET(req: Request) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const { slug, locale } = searchParams(req);
  const definition = pageContentDefinition(slug);
  if (!definition || !isValidLocale(locale)) {
    return apiError('Invalid page or locale.', 400, 'INVALID_PARAMETER');
  }

  try {
    const record = await prisma.pageContent.findUnique({
      where: { slug_locale: { slug, locale } },
    });

    return NextResponse.json({
      ok: true,
      definition,
      record,
      defaultContent: defaultPageContent(definition.slug, locale),
      fallbackImages: fallbackImages(definition),
    });
  } catch (err) {
    return apiServerError(err, 'api/admin/page-content:get');
  }
}

export async function PUT(req: Request) {
  const auth = await apiRequireStaff(req);
  if (!auth.ok) {
    return apiError(auth.message, auth.status);
  }

  const bodyCheck = await checkBodySize(req, MAX_BODY_BYTES);
  if (!bodyCheck.valid || bodyCheck.response) {
    return bodyCheck.response ?? apiError('Invalid request body.', 400);
  }

  const result = saveSchema.safeParse(bodyCheck.data);
  if (!result.success) {
    return apiValidationError(result.error.issues);
  }

  const definition = pageContentDefinition(result.data.slug);
  if (!definition) {
    return apiError('Invalid page.', 400, 'INVALID_PAGE');
  }

  const slug = definition.slug as AnyPageContentSlug;
  const locale = result.data.locale as Locale;

  const allowedImageSlots = new Set(definition.images.map((image) => image.key));
  const validImages = Object.entries(result.data.images).filter(
    ([key]) => allowedImageSlots.has(key)
  );
  if (validImages.length !== Object.keys(result.data.images).length) {
    return apiError('Invalid image field.', 400, 'INVALID_IMAGE_FIELD');
  }

  const defaultUrls = new Set(definition.images.map((image) => image.fallback));
  const mediaUrls = [...new Set(
    validImages
      .map(([, url]) => url)
      .filter((url) => !defaultUrls.has(url))
  )];

  try {
    if (mediaUrls.length > 0) {
      const foundMedia = await prisma.pageMedia.findMany({
        where: { url: { in: mediaUrls }, active: true },
        select: { url: true },
      });
      if (foundMedia.length !== mediaUrls.length) {
        return apiError('Images can only be chosen from the media library.', 400, 'INVALID_MEDIA');
      }
    }

    const record = await prisma.pageContent.upsert({
      where: { slug_locale: { slug, locale } },
      update: {
        title: definition.label,
        content: result.data.content as Prisma.InputJsonValue,
        images: Object.fromEntries(validImages) as Prisma.InputJsonValue,
        active: result.data.active,
      },
      create: {
        slug,
        locale,
        title: definition.label,
        content: result.data.content as Prisma.InputJsonValue,
        images: Object.fromEntries(validImages) as Prisma.InputJsonValue,
        active: result.data.active,
      },
    });

    return NextResponse.json({ ok: true, record });
  } catch (err) {
    return apiServerError(err, 'api/admin/page-content:put');
  }
}
