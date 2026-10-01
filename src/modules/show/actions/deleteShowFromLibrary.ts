'use server';

import { prisma } from '@/infra/db/prisma';
import { getErrorMessage, NotFoundError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const deleteShowFromLibrary = async (showId: string) => {
  try {
    const id = parseDbId(showId, 'showId');

    const show = await prisma.show.findUnique({
      where: { id },
      select: { tmdbId: true },
    });

    if (!show) {
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
