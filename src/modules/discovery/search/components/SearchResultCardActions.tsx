'use client';

import { IconCircleCheck, IconPlus } from '@tabler/icons-react';
import { ShowTrackingStatus } from '../../../../../generated/prisma/enums';
import { addMediaAction } from '@/modules/library/actions/addMediaAction';
import type { SearchResultCardActionsProps } from '@/modules/discovery/search/types/searchResultCardActions';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

const actionOptions = {
  successMessage: 'Added to your library',
  errorMessage: 'Couldn’t add this title. Please try again.',
};

export const SearchResultCardActions = ({ id, mediaType }: SearchResultCardActionsProps) => {
  const { execute: addTitle, isPending: isAddPending } = useServerAction(
    () => addMediaAction({ tmdbId: id, mediaType }),
    actionOptions,
  );
  const { execute: completeTitle, isPending: isDonePending } = useServerAction(
    () => addMediaAction({ tmdbId: id, mediaType, trackingStatus: ShowTrackingStatus.COMPLETED }),
    actionOptions,
  );

  return (
    <div className="grid w-full grid-cols-2 gap-1 rounded-pill border border-line bg-surface-soft p-1">
      <ActionButton
        disabled={isDonePending}
        isPending={isAddPending}
        onClick={addTitle}
        icon={<IconPlus size={14} className="shrink-0 text-accent-ink" />}
        title="Track as Watching"
        aria-label="Add title to library"
        className="apple-pill-btn flex cursor-pointer items-center justify-center gap-1 rounded-pill px-1 py-1 text-micro text-ink-secondary hover:bg-surface-soft-hover aria-busy:cursor-wait aria-busy:opacity-80"
      >
        <span>Add</span>
      </ActionButton>

      <ActionButton
        disabled={isAddPending}
        isPending={isDonePending}
        onClick={completeTitle}
        icon={<IconCircleCheck size={14} className="shrink-0 text-accent-ink" />}
        title="Mark Completed"
        aria-label="Add title to library as completed"
        className="apple-pill-btn flex cursor-pointer items-center justify-center gap-1 rounded-pill px-1 py-1 text-micro text-ink-secondary hover:bg-surface-soft-hover aria-busy:cursor-wait aria-busy:opacity-80"
      >
        <span>Done</span>
      </ActionButton>
    </div>
  );
};
