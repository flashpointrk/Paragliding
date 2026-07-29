/** @type {import('next').NextConfig} */

/**
 * Content Security Policy (CSP) and security headers.
 *
 * - `default-src 'self'`: only our own origin by default
 * - `script-src`: 'self' + 'unsafe-inline' (required by Next.js) +
 *   https://challenges.cloudflare.com (the Turnstile widget script)
 * - `style-src`: 'self' + 'unsafe-inline' (required by Next.js styled/inline)
 * - `img-src`: 'self' data: https: (OG images, external images, the map)
 * - `font-src`: 'self' data: (local and data-URI fonts)
 * - `connect-src`: 'self' plus the Turnstile API calls
 * - `frame-src`: https://challenges.cloudflare.com (the Turnstile iframe)
 * - `object-src 'none'`: no plugin/object loading
 * - `base-uri 'self'`, `form-action 'self'`: restrict base injection and form
 *   submission
 *
 * Note: 'unsafe-inline' in script-src and style-src is required by Next.js.
 * A nonce-based CSP can be considered in a later phase.
 *
 * These headers apply both to `next dev`/`next start` (through Next's
 * `headers()`) and behind Caddy. Caddy adds its own; applying them in both
 * places is defence in depth, with Caddy taking precedence.
 */
// Next.js dev modunda (HMR / React Refresh) `eval` gereklidir.
// The production build does not use eval, so this is only added in dev.
const isDev = process.env.NODE_ENV === 'development';
const scriptSrc = isDev
  ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com`
  : `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      `default-src 'self'`,
      scriptSrc,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: https:`,
      `font-src 'self' data:`,
      `connect-src 'self' https://challenges.cloudflare.com`,
      `frame-src https://challenges.cloudflare.com`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `object-src 'none'`,
    ].join('; '),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  {
    // DNS prefetching disabled — it must not leak information.
    key: 'X-DNS-Prefetch-Control',
    value: 'off',
  },
  {
    // Block Adobe Flash / PDF cross-domain policy files.
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
      ]),
];

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // A bulk gallery upload can carry several files in one request. Because
    // middleware is active in this app, Next's default 10 MB body limit kicked
    // in before `request.formData()` was ever reached.
    // Keep it aligned with the single-video limit (200 MB) and the reverse proxy.
    proxyClientMaxBodySize: '250mb',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply the security headers to every route.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
