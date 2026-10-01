import { revalidatePath } from 'next/cache';
import type { MediaType } from '@/shared/types/media';

export const revalidateLibrary = () => {
  revalidatePath('/');
  revalidatePath('/library');
};

export const revalidateMediaDetail = (mediaType: MediaType, tmdbId: number) => {
  revalidateLibrary();
  revalidatePath(`/library/${mediaType}/${tmdbId}`);
};
