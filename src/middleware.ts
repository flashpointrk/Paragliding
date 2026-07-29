import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n/locales';
import { localizedSlug, sourceSlug, LEGACY_TR_PATHS } from '@/lib/i18n/paths';

/**
 * Locale routing.
 *
 * Pages live under `src/app/[locale]/...` with English folder names, and
 * English is the default locale, so unprefixed requests are **rewritten** onto
 * `/en/...`: the address bar keeps the clean URL while the right segment
 * renders. Turkish requests arrive as `/tr/<translated-slug>` and are rewritten
 * onto the English folder.
 *
 * Left alone: /api, /admin, /login, Next internals and public files (anything
 * with a file extension).
 */

const SKIP = ['/api', '/admin', '/login', '/_next', '/_vercel'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (SKIP.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  // A file extension means a public asset (favicon.png, images/... and friends).
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return NextResponse.next();

  // The root layout reads the locale for `<html lang>` from this header.
  const headers = new Headers(req.headers);

  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0];

  if (first && (LOCALES as readonly string[]).includes(first)) {
    headers.set('x-locale', first);

    if (isValidLocale(first) && first !== DEFAULT_LOCALE) {
      const localized = `/${parts.slice(1).join('/')}`;

      // Reaching a Turkish page through its English slug (`/tr/gallery`) is
      // permanently redirected to the translated one, so the same content is
      // never published at two addresses.
      const translated = localizedSlug(first, localized);
      if (translated !== localized) {
        const url = req.nextUrl.clone();
        url.pathname = `/${first}${translated}`;
        return NextResponse.redirect(url, 308);
      }

      const source = sourceSlug(first, localized);
      if (source !== localized) {
        const url = req.nextUrl.clone();
        url.pathname = `/${first}${source === '/' ? '' : source}`;
        return NextResponse.rewrite(url, { request: { headers } });
      }
    }

    // `/en/...` is the default locale spelled out; collapse it to the clean URL.
    if (first === DEFAULT_LOCALE) {
      const rest = `/${parts.slice(1).join('/')}`;
      const url = req.nextUrl.clone();
      url.pathname = rest === '/' ? '/' : rest;
      return NextResponse.redirect(url, 308);
    }

    return NextResponse.next({ request: { headers } });
  }

  // Turkish pages used to be served without a prefix. Those addresses are still
  // linked to and indexed, so they redirect permanently to their `/tr` form
  // rather than silently rendering the English page.
  const legacy = LEGACY_TR_PATHS[pathname];
  if (legacy) {
    const url = req.nextUrl.clone();
    url.pathname = legacy;
    return NextResponse.redirect(url, 301);
  }

  headers.set('x-locale', DEFAULT_LOCALE);
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
