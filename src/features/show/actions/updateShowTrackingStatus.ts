'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const updateShowTrackingStatus = async (showId: string, status: ShowTrackingStatus) => {
  const allowedStatuses: ShowTrackingStatus[] = [
    ShowTrackingStatus.PLAN_TO_WATCH,
    ShowTrackingStatus.DROPPED,
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid tracking status');
  }

  const show = await prisma.show.findUnique({
    where: {
      id: showId,
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

  if (!show) {
    throw new Error('Show not found');
  }

  await prisma.showTracking.upsert({
    where: {
      showId,
    },
    create: {
      showId,
      status,
      startedAt: status === ShowTrackingStatus.DROPPED ? new Date() : null,
      completedAt: null,
    },
    update: {
      status,
      startedAt:
        status === ShowTrackingStatus.PLAN_TO_WATCH
          ? null
          : (show.tracking?.startedAt ?? new Date()),
      completedAt: null,
    },
  });

  revalidatePath('/');
  revalidatePath(`/tv/${showId}`);
};
