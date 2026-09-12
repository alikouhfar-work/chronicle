import { MediaType } from '@/types/media';

export type LibraryMediaViewDetailsButtonProps = {
  unstyled?: boolean;
  tmdbId: number;
  mediaType: MediaType;
  className?: string;
  showIcon?: boolean;
};
