'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { getErrorMessage, NotFoundError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const deleteShowFromLibrary = async (showId: string) => {
  try {
    const id = parseDbId(showId, 'showId');
    const userId = await requireUserId();

    const show = await prisma.show.findUnique({
      where: { id },
      select: { tmdbId: true, userId: true },
    });

    if (!show || show.userId !== userId) {
      throw new NotFoundError(`Show not found: ${id}`);
    }

    await prisma.show.delete({
      where: {
        id,
      },
    });

    revalidateMediaDetail('tv', show.tmdbId);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to delete show'),
    };
  }
};
