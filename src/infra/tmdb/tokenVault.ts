import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const resolveKey = (): Buffer => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('[tokenVault] AUTH_SECRET is not defined');
  return createHash('sha256').update(`chronicle-tmdb-vault:${secret}`).digest();
};

export const encryptTmdbToken = (plaintext: string): { iv: string; ciphertext: string } => {
  const key = resolveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    ciphertext: Buffer.concat([encrypted, tag]).toString('base64'),
  };
};

export const decryptTmdbToken = (iv: string, ciphertext: string): string => {
  const key = resolveKey();
  const ivBuf = Buffer.from(iv, 'hex');
  const combined = Buffer.from(ciphertext, 'base64');
  if (ivBuf.length !== IV_LENGTH || combined.length < 17) {
    throw new Error('[tokenVault] malformed token payload');
  }
  const tag = combined.subarray(combined.length - 16);
  const encrypted = combined.subarray(0, combined.length - 16);
  const decipher = createDecipheriv(ALGORITHM, key, ivBuf);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
};

export const maskTmdbToken = (last4: string): string => `••••${last4}`;
