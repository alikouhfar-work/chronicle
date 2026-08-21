import { MediaType } from '@/types/media';

export type AddMediaParams = {
  tmdbId: number;
  mediaType: MediaType;
};

export type AddMediaActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };