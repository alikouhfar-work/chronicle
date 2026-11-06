'use client';

import { useState } from 'react';
import { IconEye, IconEyeCheck } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { clsx } from 'clsx';
import { markShowWatched } from '@/modules/show/actions/markShowWatched';
import type { LibraryDetailsShowWatchToggleProps } from '@/modules/library/types/libraryDetailsShowWatchToggle';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

const WatchActionModal = dynamic(
  () => import('@/modules/rewatch/components/WatchActionModal').then((m) => m.WatchActionModal),
  { ssr: false },
);

/**
 * Watch control for a whole show. Mirrors the episode card: an unwatched show
 * is marked watched on click, while an already-watched show opens the
 * rewatch/unwatch confirmation dialog.
 */
export const LibraryDetailsShowWatchToggle = ({
  showId,
  showName,
  showWatched,
  rewatchCount,
}: LibraryDetailsShowWatchToggleProps) => {
  const [optimistic, setOptimistic] = useState<{ watched: boolean; count: number } | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const watched = optimistic?.watched ?? showWatched;
  const count = optimistic?.count ?? rewatchCount;
  const displayCount = Math.max(count, watched ? 1 : 0);

  const { execute: markWatched, isPending } = useServerAction(
    () => markShowWatched(showId),
    { errorMessage: 'Couldn’t update the show. Please try again.' },
  );

  const handleClick = () => {
    if (watched) {
      setIsOptionsOpen(true);
      return;
    }

    void markWatched();
  };

  return (
    <>
      {isOptionsOpen && (
        <WatchActionModal
          mediaType="show"
          mediaId={showId}
          title={showName}
          watchCount={displayCount}
          onRewatch={(nextCount) => setOptimistic({ watched: true, count: nextCount })}
          onUnwatch={(nextCount) => setOptimistic({ watched: false, count: nextCount })}
          onClose={() => setIsOptionsOpen(false)}
        />
      )}

      <ActionButton
        onClick={handleClick}
        isPending={isPending}
        aria-haspopup={watched ? 'dialog' : undefined}
        icon={
          watched ? (
            <IconEyeCheck size={14} className="text-emerald-400" />
          ) : (
            <IconEye size={14} className="text-violet-400" />
          )
        }
        aria-pressed={watched}
        aria-label={watched ? `Show options for ${showName}` : 'Mark entire show as watched'}
        className={clsx(
          'apple-pill-btn flex w-full cursor-pointer items-center gap-1.5 px-3 py-1.5 pl-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80',
          watched
            ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            : 'border border-violet-500/35 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30',
        )}
      >
        <span>{watched ? 'Show Watched' : 'Mark Show Watched'}</span>
      </ActionButton>
    </>
  );
};
