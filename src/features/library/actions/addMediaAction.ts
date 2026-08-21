'use server';

import { revalidatePath } from 'next/cache';
import { importMedia } from '@/features/library/services/importMedia';
import { MediaType } from '@/types/media';

export const addMedia = async (tmdbId: number, mediaType: MediaType) => {
  await importMedia({
    tmdbId,
    mediaType,
  });

  revalidatePath('/');
  revalidatePath('/library');
};
