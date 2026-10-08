import { describe, expect, it, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  process.env.AUTH_SECRET = 'test-secret-for-vault';
});

describe('tokenVault', () => {
  it('roundtrips encrypt/decrypt', async () => {
    const { encryptTmdbToken, decryptTmdbToken } = await import('./tokenVault');
    const { iv, ciphertext } = encryptTmdbToken('eyJtest-token');
    expect(iv).toMatch(/^[0-9a-f]+$/);
    expect(decryptTmdbToken(iv, ciphertext)).toBe('eyJtest-token');
  });

  it('produces different ciphertexts for the same plaintext (random IV)', async () => {
    const { encryptTmdbToken } = await import('./tokenVault');
    const a = encryptTmdbToken('eyJsame');
    const b = encryptTmdbToken('eyJsame');
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('throws on malformed payload', async () => {
    const { decryptTmdbToken } = await import('./tokenVault');
    expect(() => decryptTmdbToken('deadbeef', 'bm90LXZhbGlk')).toThrow();
  });

  it('masks tokens', async () => {
    const { maskTmdbToken } = await import('./tokenVault');
    expect(maskTmdbToken('abcd')).toBe('••••abcd');
  });
});
