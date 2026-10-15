'use client';

import { IconEye, IconEyeCheck } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { setShowWatched } from '@/modules/show/actions/setShowWatched';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

type LibraryDetailsShowWatchToggleProps = {
  showId: string;
  seriesWatched: boolean;
};

export const LibraryDetailsShowWatchToggle = ({
  showId,
  seriesWatched,
}: LibraryDetailsShowWatchToggleProps) => {
  const { execute: toggleShowWatched, isPending } = useServerAction(
    () => setShowWatched(showId, !seriesWatched),
    { errorMessage: 'Couldn’t update the show. Please try again.' },
  );

  return (
    <ActionButton
      onClick={toggleShowWatched}
      isPending={isPending}
      icon={
        seriesWatched ? (
          <IconEyeCheck size={14} className="text-emerald-400" />
        ) : (
          <IconEye size={14} className="text-violet-400" />
        )
      }
      aria-label={seriesWatched ? 'Mark show as not watched' : 'Mark entire show as watched'}
      className={clsx(
        'apple-pill-btn flex w-full cursor-pointer items-center gap-1.5 px-3 py-1.5 pl-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80',
        seriesWatched
          ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
          : 'border border-violet-500/35 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30',
      )}
    >
      <span>{seriesWatched ? 'Show Watched' : 'Mark Show Watched'}</span>
    </ActionButton>
  );
};
