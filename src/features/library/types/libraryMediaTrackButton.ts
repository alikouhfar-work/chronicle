import { MediaType } from '@/types/media';

export type LibraryMediaTrackButtonProps = {
  unstyled?: boolean;
  tmdbId: number;
  mediaType: MediaType;
  className?: string;
  label?: string;
};