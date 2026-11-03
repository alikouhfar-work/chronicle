/**
 * The only user fields allowed in public payloads (reviews, mentions,
 * notification actors). Never add `email` here.
 */
export const publicUserSelect = {
  id: true,
  username: true,
  name: true,
  image: true,
} as const;

export type { PublicUser } from '@/modules/user/types';
