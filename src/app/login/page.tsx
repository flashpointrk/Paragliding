/**
 * Sign-in page (/login) — the "Open Sky" design language, kept plain.
 *
 * Signs in with NextAuth credentials (e-mail plus password) and, on success,
 * redirects to `callbackUrl` (defaulting to `/admin`).
 *
 * A calm navy background with a flat white card. NO aurora, mesh, glass or
 * shimmer.
 *
 * The page itself is public; the admin layout performs its own role check.
 *
 * Note: `useSearchParams` requires Suspense, so the form lives in its own
 * client component (LoginForm) wrapped in a Suspense boundary.
 */

import { Suspense } from 'react';
import { SITE } from '@/lib/site';
import { LoginForm } from './LoginForm';
import { BrandMark } from '@/components/site/BrandMark';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Brand lockup — logo plus title */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <BrandMark
            className="flex flex-col items-center gap-3 text-white"
            glyphClassName="h-20 w-auto"
            wordmarkClassName="font-display text-2xl font-extrabold uppercase tracking-tight"
          />
          <h1 className="text-sm font-medium text-sand-300">
            Admin panel sign-in
          </h1>
        </div>

        {/* Flat white card */}
        <div className="relative rounded-2xl border border-sand-200 bg-white p-8 shadow-soft-lg">
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="font-display text-xl font-bold text-navy-900">
              Welcome
            </h2>
            <p className="text-sm text-navy-500">
              Sign in with your administrator credentials to continue.
            </p>
          </div>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-sand-400">
          © {new Date().getFullYear()} {SITE.shortName}. Unauthorized access is prohibited.
        </p>
      </div>
    </main>
  );
}

/** Plain skeleton loading state. */
function LoginFormFallback() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-11 animate-pulse rounded-lg bg-sand-100" />
      <div className="h-11 animate-pulse rounded-lg bg-sand-100" />
      <div className="h-12 animate-pulse rounded-full bg-sand-100" />
    </div>
  );
}
