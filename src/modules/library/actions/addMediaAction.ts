'use server';

import { revalidatePath } from 'next/cache';
import { addMediaToLibrary } from '@/modules/library/actions/addMediaToLibrary';
import type { AddMediaActionResult, AddMediaParams } from '@/modules/library/types/addMedia';

export const addMediaAction = async (params: AddMediaParams): Promise<AddMediaActionResult> => {
  try {
    await addMediaToLibrary(params);

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