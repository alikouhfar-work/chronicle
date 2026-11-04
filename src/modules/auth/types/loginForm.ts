import type { AuthProviderId } from '@/infra/auth/types';

export type LoginFormProps = {
  providers: { id: AuthProviderId; name: string }[];
  callbackUrl: string;
  authError: string | null;
};
