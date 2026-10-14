import { createHash } from 'node:crypto';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// Mobile/API JWT. Contract (stable for the future Java backend):
//   alg HS256, claims { sub: userId, email, iat, exp }, key = SHA-256("chronicle-mobile-jwt:" + AUTH_SECRET).
// Any backend implementing this contract authenticates the same mobile app.
const ALGORITHM = 'HS256';
const ISSUER = 'chronicle';
const EXPIRY = '30d';

export type MobileJwtClaims = JWTPayload & {
  sub: string;
  email: string;
};

const resolveKey = (): Uint8Array => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('[mobileJwt] AUTH_SECRET is not defined');
  return new Uint8Array(createHash('sha256').update(`chronicle-mobile-jwt:${secret}`).digest());
};

export const signMobileJwt = async (userId: string, email: string): Promise<string> =>
  new SignJWT({ email })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuer(ISSUER)
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(resolveKey());

export const verifyMobileJwt = async (token: string): Promise<MobileJwtClaims> => {
  const { payload } = await jwtVerify(token, resolveKey(), { issuer: ISSUER });
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('[mobileJwt] missing sub claim');
  }
  return payload as MobileJwtClaims;
};
