'use server';

import { prisma } from '@/infra/db/prisma';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { buildTrackingTimestamps } from '@/modules/media/tracking';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const updateShowTrackingStatus = async (showId: string, status: ShowTrackingStatus) => {
  try {
    const id = parseDbId(showId, 'showId');
    const allowedStatuses: ShowTrackingStatus[] = [
      ShowTrackingStatus.PLAN_TO_WATCH,
      ShowTrackingStatus.DROPPED,
    ];

    if (!allowedStatuses.includes(status)) {
      throw new ValidationError(`Invalid show tracking status: ${status}`);
    }

    const show = await prisma.show.findUnique({
      where: { id },
      select: { id: true, tmdbId: true, tracking: { select: { startedAt: true } } },
    });

    if (!show) {
      throw new NotFoundError(`Show not found: ${id}`);
    }

    const timestamps = buildTrackingTimestamps(status, show.tracking?.startedAt);

    await prisma.showTracking.upsert({
      where: { showId: id },
      create: { showId: id, status, ...timestamps },
      update: { status, ...timestamps },
    });

    revalidateMediaDetail('tv', show.tmdbId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to update show status', { cause: error });
  }
};
