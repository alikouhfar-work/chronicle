'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { MovieTrackingStatus } from '../../../../generated/prisma/enums';

export const updateMovieTrackingStatus = async (movieId: string, status: MovieTrackingStatus) => {
  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    select: {
      id: true,
      tracking: {
        select: {
          startedAt: true,
        },
      },
    },
  });

  if (!movie) {
    throw new Error('Movie not found');
  }

  const now = new Date();

  const data = {
    status,
    startedAt:
      status === MovieTrackingStatus.PLAN_TO_WATCH ? null : (movie.tracking?.startedAt ?? now),
    completedAt: status === MovieTrackingStatus.COMPLETED ? now : null,
  };

  await prisma.movieTracking.upsert({
    where: {
      movieId,
    },
    create: {
      movieId,
      ...data,
    },
    update: data,
  });

  revalidatePath(`/library/movie/${movieId}`);
};
