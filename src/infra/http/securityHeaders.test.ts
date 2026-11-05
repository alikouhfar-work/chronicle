import { describe, expect, it } from 'vitest';
import { buildSecurityHeaders } from '@/infra/http/securityHeaders';

const headerMap = (headers: ReturnType<typeof buildSecurityHeaders>) =>
  Object.fromEntries(headers.map((header) => [header.key, header.value]));

describe('buildSecurityHeaders', () => {
  it('sets the baseline hardening headers', () => {
    const headers = headerMap(buildSecurityHeaders({ isProduction: false }));

    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Permissions-Policy']).toContain('geolocation=()');
  });

  it('ships the CSP as report-only first', () => {
    const headers = headerMap(buildSecurityHeaders({ isProduction: false }));

    expect(headers['Content-Security-Policy']).toBeUndefined();
    expect(headers['Content-Security-Policy-Report-Only']).toContain("default-src 'self'");
    expect(headers['Content-Security-Policy-Report-Only']).toContain("frame-ancestors 'none'");
    expect(headers['Content-Security-Policy-Report-Only']).toContain("object-src 'none'");
  });

  it('allows TMDB posters and the configured storage origin in img-src', () => {
    const csp = headerMap(
      buildSecurityHeaders({ isProduction: false, storageOrigin: 'https://cdn.example.com' }),
    )['Content-Security-Policy-Report-Only'];

    expect(csp).toContain('https://image.tmdb.org');
    expect(csp).toContain('https://cdn.example.com');
  });

  it('omits the storage origin when none is configured', () => {
    const csp = headerMap(buildSecurityHeaders({ isProduction: false, storageOrigin: '' }))[
      'Content-Security-Policy-Report-Only'
    ];

    expect(csp).not.toContain('undefined');
    expect(csp.split(';').find((part) => part.trim().startsWith('img-src'))).toBeTruthy();
  });

  it('only sends HSTS in production', () => {
    expect(headerMap(buildSecurityHeaders({ isProduction: false }))['Strict-Transport-Security']).toBeUndefined();

    const production = headerMap(buildSecurityHeaders({ isProduction: true }));
    expect(production['Strict-Transport-Security']).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
  });
});
