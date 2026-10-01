'use client';

import type { LibraryShowStatusChangeButtonProps } from '@/modules/library/types/libraryShowStatusChangeButton';
import { updateShowTrackingStatus } from '@/modules/show/actions/updateShowTrackingStatus';
import { ShowTrackingStatus } from '../../../../../generated/prisma/enums';
import { LibraryStatusChangeButton } from '@/modules/library/components/LibraryStatusChangeButton';

export const LibraryShowStatusChangeButton = ({
  showId,
  showStatus,
  statusFilter,
}: LibraryShowStatusChangeButtonProps) => {
  const automatic =
    statusFilter.key === ShowTrackingStatus.WATCHING ||
    statusFilter.key === ShowTrackingStatus.COMPLETED;

  return (
    <LibraryStatusChangeButton
      entityId={showId}
      entityLabel="Show"
      currentStatus={showStatus}
      statusFilter={statusFilter}
      disabled={automatic}
      updateStatus={(id, key) =>
        updateShowTrackingStatus(id, key as ShowTrackingStatus)
      }
    />
  );
};
