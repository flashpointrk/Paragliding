/**
 * Validation schema for gallery media URLs.
 *
 * Two shapes are accepted:
 *  - A site-relative path starting with "/" (for local uploads under
 *    `/uploads/gallery/...` and static images under `/images/...`). A path
 *    starting with "//" is REJECTED — that is a protocol-relative external
 *    address, which the browser treats as absolute (e.g. "//evil.com/x.png").
 *  - An absolute http(s) URL.
 *
 * Shared by `POST /api/admin/gallery` and `PATCH/PUT /api/admin/gallery/[id]`,
 * so the two schemas cannot drift apart.
 */

import { z } from 'zod';

export const galleryUrlSchema = z
  .string()
  .trim()
  .min(1, 'A media URL is required.')
  .max(2000)
  .refine(
    (v) => /^https?:\/\//i.test(v) || (v.startsWith('/') && !v.startsWith('//')),
    {
      message:
        'The URL must start with http:// or https://, or be a site-relative path beginning with "/".',
    }
  );
