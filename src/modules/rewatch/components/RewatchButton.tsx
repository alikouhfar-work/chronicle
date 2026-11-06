'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { IconHistory, IconLoader2, IconRotateClockwise } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { addRewatch } from '@/modules/rewatch/actions/addRewatch';
import type { RewatchButtonProps } from '@/modules/rewatch/types/rewatch';
import { toastError } from '@/shared/lib/toast';

// Both dialogs only exist after a click, so they stay out of the page's first-load graph.
const RewatchHistoryModal = dynamic(
  () => import('@/modules/rewatch/components/RewatchHistoryModal').then((m) => m.RewatchHistoryModal),
  { ssr: false },
);
const WatchActionModal = dynamic(
  () => import('@/modules/rewatch/components/WatchActionModal').then((m) => m.WatchActionModal),
  { ssr: false },
);

const LONG_PRESS_MS = 550;

export const RewatchButton = ({
  mediaType,
  mediaId,
  initialCount,
  watched = false,
  historyTitle,
  variant = 'pill',
  fullWidth = false,
  className,
}: RewatchButtonProps) => {
  const router = useRouter();
  // Keep the optimistic count tied to the server value it was derived from, so
  // a refreshed prop always wins without a setState-in-effect cascade.
  const [optimisticCount, setOptimisticCount] = useState<{
    base: number;
    value: number;
  } | null>(null);
  const count =
    optimisticCount?.base === initialCount ? optimisticCount.value : initialCount;
  // A completed movie/show/season has been watched even when no log exists yet.
  const watchedOnce = count >= 1 || watched;
  const displayCount = Math.max(count, watched ? 1 : 0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => clearLongPress, [clearLongPress]);

  const openHistory = useCallback(() => {
    clearLongPress();
    setHistoryOpen(true);
  }, [clearLongPress]);

  const handleCountChange = useCallback(
    (nextCount: number) => {
      setOptimisticCount({ base: initialCount, value: nextCount });
    },
    [initialCount],
  );

  const handleAdd = () => {
    if (isPending) return;

    setOptimisticCount({ base: initialCount, value: count + 1 });

    startTransition(async () => {
      const result = await addRewatch(mediaType, mediaId);

      if (!result.success) {
        setOptimisticCount(null);
        toastError(result.error);
        return;
      }

      setOptimisticCount({ base: initialCount, value: result.rewatchCount });
      router.refresh();
    });
  };

  const handlePointerDown = () => {
    clearLongPress();
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      openHistory();
    }, LONG_PRESS_MS);
  };

  const handleClick = () => {
    clearLongPress();
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }

    // Anything already watched at least once asks first: another watch, or
    // remove the watch instead of silently incrementing.
    if (watchedOnce) {
      setOptionsOpen(true);
      return;
    }

    handleAdd();
  };

  return (
    <>
      {optionsOpen && (
        <WatchActionModal
          mediaType={mediaType}
          mediaId={mediaId}
          title={historyTitle ?? 'This item'}
          watchCount={displayCount}
          onRewatch={handleCountChange}
          onUnwatch={handleCountChange}
          onClose={() => setOptionsOpen(false)}
        />
      )}

      {historyOpen && (
        <RewatchHistoryModal
          mediaType={mediaType}
          mediaId={mediaId}
          title={historyTitle ?? 'This item'}
          initialCount={count}
          onCountChange={handleCountChange}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      <div
        className={clsx(
          'items-stretch overflow-hidden rounded-full border transition-colors',
          fullWidth ? 'flex w-full' : 'inline-flex w-fit',
          count > 0
            ? 'border-violet-400/40 bg-violet-500/20 text-violet-200'
            : 'border-white/10 bg-white/5 text-zinc-300',
          className,
        )}
      >
        <button
          type="button"
          onClick={handleClick}
          aria-haspopup={watchedOnce ? 'dialog' : undefined}
          onPointerDown={handlePointerDown}
          onPointerUp={clearLongPress}
          onPointerLeave={clearLongPress}
          onPointerCancel={clearLongPress}
          onContextMenu={(event) => {
            event.preventDefault();
            openHistory();
          }}
          disabled={isPending}
          aria-busy={isPending}
          aria-label={
            watchedOnce
              ? `Watch options. ${displayCount} ${
                  displayCount === 1 ? 'watch' : 'watches'
                } logged.`
              : 'Log a watch.'
          }
          title={
            watchedOnce
              ? 'Click for rewatch/unwatch options. Long-press or right-click for history.'
              : 'Click to log a watch. Long-press or right-click for history.'
          }
          className={clsx(
            'group flex cursor-pointer items-center gap-1.5 font-semibold transition-colors hover:bg-white/8 disabled:cursor-wait disabled:opacity-70',
            fullWidth && 'flex-1 justify-center',
            variant === 'compact' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
          )}
        >
          {isPending ? (
            <IconLoader2
              size={variant === 'compact' ? 12 : 14}
              className="animate-spin text-violet-300"
            />
          ) : (
            <IconRotateClockwise
              size={variant === 'compact' ? 12 : 14}
              className="text-violet-300 transition-transform duration-300 group-hover:-rotate-45"
            />
          )}
          <span aria-live="polite">Watch ({count})</span>
        </button>

        <button
          type="button"
          onClick={openHistory}
          aria-label="Open watch history and add a custom date"
          title="Watch history / add a custom date"
          className={clsx(
            'flex cursor-pointer items-center justify-center border-l border-white/10 text-zinc-400 transition-colors hover:bg-white/8 hover:text-violet-200',
            variant === 'compact' ? 'px-1.5' : 'px-2',
          )}
        >
          <IconHistory size={variant === 'compact' ? 12 : 14} />
        </button>
      </div>
    </>
  );
};
