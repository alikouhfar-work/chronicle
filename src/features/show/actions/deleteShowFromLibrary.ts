'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const deleteShowFromLibrary = async (showId: string) => {
  try {
    await prisma.show.delete({
      where: {
        id: showId,
      },
    });

    revalidatePath('/library');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to delete show:', error);

    return {
      success: false,
      error: 'Failed to delete show',
    };
  }
};
