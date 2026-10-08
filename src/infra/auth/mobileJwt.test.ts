import { describe, expect, it, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  process.env.AUTH_SECRET = 'test-secret-for-mobile-jwt';
});

describe('mobileJwt', () => {
  it('roundtrips sign/verify with sub + email', async () => {
    const { signMobileJwt, verifyMobileJwt } = await import('./mobileJwt');
    const token = await signMobileJwt('user-123', 'a@b.c');
    const claims = await verifyMobileJwt(token);
    expect(claims.sub).toBe('user-123');
    expect(claims.email).toBe('a@b.c');
  });

  it('rejects tampered tokens', async () => {
    const { signMobileJwt, verifyMobileJwt } = await import('./mobileJwt');
    const token = await signMobileJwt('user-123', 'a@b.c');
    await expect(verifyMobileJwt(`${token.slice(0, -2)}xx`)).rejects.toThrow();
  });

  it('rejects tokens signed with a different secret (backend rotation)', async () => {
    const { signMobileJwt, verifyMobileJwt } = await import('./mobileJwt');
    const token = await signMobileJwt('user-123', 'a@b.c');
    process.env.AUTH_SECRET = 'different-secret';
    await expect(verifyMobileJwt(token)).rejects.toThrow();
  });

  it('rejects expired tokens', async () => {
    const { SignJWT } = await import('jose');
    const { createHash } = await import('node:crypto');
    const key = new Uint8Array(
      createHash('sha256').update(`chronicle-mobile-jwt:${process.env.AUTH_SECRET}`).digest(),
    );
    const expired = await new SignJWT({ email: 'a@b.c' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('chronicle')
      .setSubject('user-123')
      .setIssuedAt(Math.floor(Date.parse('2020-01-01T00:00:00Z') / 1000))
      .setExpirationTime(Math.floor(Date.parse('2020-01-02T00:00:00Z') / 1000))
      .sign(key);
    const { verifyMobileJwt } = await import('./mobileJwt');
    await expect(verifyMobileJwt(expired)).rejects.toThrow();
  });
});
