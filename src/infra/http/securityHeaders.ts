export type SecurityHeader = { key: string; value: string };

type SecurityHeaderOptions = {
  isProduction?: boolean;
  /** Public origin serving uploaded attachments (S3/CDN), added to img-src. */
  storageOrigin?: string;
};

/**
 * Response headers applied to every route.
 *
 * The CSP ships report-only first: Next injects an inline bootstrap script, so
 * `script-src` needs `'unsafe-inline'` until a nonce is wired through the
 * document. Once the reports are clean, flip the key to
 * `Content-Security-Policy` and tighten `script-src`.
 */
export const buildSecurityHeaders = (options: SecurityHeaderOptions = {}): SecurityHeader[] => {
  // Read directly on purpose: next.config.ts imports this module by relative path
  // (it cannot resolve `@/`), so pulling in `infra/env` here would break config load.
  const isProduction = options.isProduction ?? process.env.NODE_ENV === 'production';
  const storageOrigin = options.storageOrigin ?? process.env.S3_PUBLIC_BASE_URL ?? '';

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://image.tmdb.org',
    storageOrigin,
  ]
    .filter(Boolean)
    .join(' ');

  const csp = [
    "default-src 'self'",
    `img-src ${imgSrc}`,
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    },
    { key: 'Content-Security-Policy-Report-Only', value: csp },
    ...(isProduction
      ? [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ]
      : []),
  ];
};
