'use server';

import { revalidatePath } from 'next/cache';
import { addMedia } from '@/features/library/services/addMedia';
import { AddMediaActionResult, AddMediaParams } from '@/features/library/types/addMedia';

export const addMediaAction = async (params: AddMediaParams): Promise<AddMediaActionResult> => {
  try {
    await addMedia(params);

    revalidatePath('/');
    revalidatePath('/library');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add media.',
    };
  }
};
