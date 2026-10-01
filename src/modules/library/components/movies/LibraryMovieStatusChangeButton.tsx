'use client';

import type { LibraryMovieStatusChangeButtonProps } from '@/modules/library/types/libraryMovieStatusChangeButton';
import { updateMovieTrackingStatus } from '@/modules/movie/actions/updateMovieTrackingStatus';
import type { MovieTrackingStatus } from '../../../../../generated/prisma/enums';
import { LibraryStatusChangeButton } from '@/modules/library/components/LibraryStatusChangeButton';

export const LibraryMovieStatusChangeButton = ({
  movieId,
  movieStatus,
  statusFilter,
}: LibraryMovieStatusChangeButtonProps) => {
  return (
    <LibraryStatusChangeButton
      entityId={movieId}
      entityLabel="Movie"
      currentStatus={movieStatus}
      statusFilter={statusFilter}
      updateStatus={(id, key) =>
        updateMovieTrackingStatus(id, key as MovieTrackingStatus)
      }
    />
  );
};
