import { MediaType } from '@/types/media';

export type TrackButtonProps = {
  unstyled?: boolean;
  tmdbId: number;
  mediaType: MediaType;
  className?: string;
  label?: string;
};