import type { MediaType } from '@/shared/types/media';

export type LibraryDetailsParams = {
  slug: [MediaType, string];
};

export type LibraryDetailsPageProps = {
  params: Promise<LibraryDetailsParams>;
};
