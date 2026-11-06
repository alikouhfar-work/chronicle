'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { IconCircle } from '@tabler/icons-react';
import type { ShowDetailsEpisodeCardToggleButtonProps } from '@/modules/episode-season/types/showDetailsEpisodeCardToggleButtonProps';
import { addRewatch } from '@/modules/rewatch/actions/addRewatch';
import { toastError } from '@/shared/lib/toast';
import { ActionButton } from '@/shared/ui/ActionButton';

const WatchActionModal = dynamic(
  () => import('@/modules/rewatch/components/WatchActionModal').then((m) => m.WatchActionModal),
  { ssr: false },
);

export const ShowDetailsEpisodeCardToggleButton = ({
  episodeId,
  episodeName,
  episodeNumber,
  isWatched,
  rewatchCount,
}: ShowDetailsEpisodeCardToggleButtonProps) => {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<{
    watched: boolean;
    count: number;
  } | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const watched = optimistic?.watched ?? isWatched;
  const count = optimistic?.count ?? rewatchCount;
  // A watched episode always represents at least one viewing.
  const displayCount = Math.max(count, 1);

  const handleWatch = () => {
    if (isPending) return;

    // A watched episode already has at least one log: clicking the badge asks
    // whether this is a rewatch or an unwatch instead of silently adding one.
    if (watched || count >= 1) {
      setIsOptionsOpen(true);
      return;
    }

    setOptimistic({ watched: true, count: rewatchCount + 1 });

    startTransition(async () => {
      const result = await addRewatch('episode', episodeId);

      if (!result.success) {
        setOptimistic(null);
        toastError(result.error);
        return;
      }

      setOptimistic({ watched: true, count: result.rewatchCount });
      router.refresh();
    });
  };

  return (
    <>
      {isOptionsOpen && (
        <WatchActionModal
          mediaType="episode"
          mediaId={episodeId}
          title={episodeName}
          subtitle={`Episode ${episodeNumber}`}
          watchCount={displayCount}
          onRewatch={(nextCount) => setOptimistic({ watched: true, count: nextCount })}
          onUnwatch={(nextCount) => setOptimistic({ watched: false, count: nextCount })}
          onClose={() => setIsOptionsOpen(false)}
        />
      )}

      <ActionButton
        onClick={handleWatch}
        isPending={isPending}
        aria-haspopup={watched || count >= 1 ? 'dialog' : undefined}
        pendingIcon={
          <span className="block size-4 animate-spin rounded-pill border-2 border-current border-t-transparent" />
        }
        icon={
          watched ? (
            <span className="text-micro leading-none font-bold">{displayCount}</span>
          ) : (
            <IconCircle size={20} />
          )
        }
        aria-pressed={watched}
        aria-label={
          watched
            ? `Episode options for ${episodeName}. ${displayCount} ${
                displayCount === 1 ? 'watch' : 'watches'
              } logged.`
            : `Mark ${episodeName} as watched`
        }
        title={watched ? 'Episode options' : 'Mark as watched'}
        className={`mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-pill transition-transform duration-150 active:scale-90 ${
          watched
            ? 'bg-accent-bright/15 text-accent-ink'
            : 'bg-surface-strong text-ink-subtle hover:text-ink-secondary'
        }`}
      />
    </>
  );
};
