export type { ProfileSummary } from './profileSummary';

export type UsernameState = {
  success: boolean;
  error?: string;
};

export type PublicUser = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
};
