import type { JWTPayload } from 'jose';

export type MobileJwtClaims = JWTPayload & {
  sub: string;
  email: string;
};

export type AuthProviderId = 'google' | 'credentials' | 'guest';

export type AvailableProvider = {
  id: AuthProviderId;
  name: string;
};
