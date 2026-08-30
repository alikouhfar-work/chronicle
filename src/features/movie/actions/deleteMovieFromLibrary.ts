'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const deleteMovieFromLibrary = async (movieId: string) => {
  try {
    await prisma.movie.delete({
      where: {
        id: movieId,
      },
    });

    revalidatePath('/library');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to delete movie:', error);

    return {
      success: false,
      error: 'Failed to delete movie',
    };
  }
};
