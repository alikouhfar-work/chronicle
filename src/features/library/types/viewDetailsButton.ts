import { MediaType } from '@/types/media';

export type ViewDetailsButtonProps = {
  unstyled?: boolean;
  tmdbId: number;
  mediaType: MediaType;
  className?: string;
  showIcon?: boolean;
};
