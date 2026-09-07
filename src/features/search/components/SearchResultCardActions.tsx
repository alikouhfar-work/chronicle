'use client';

import { IconCircleCheck, IconLoader2, IconPlus } from '@tabler/icons-react';
import { FC, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { addMediaAction } from '@/features/library/actions/addMediaAction';
import { SearchResultCardActionsProps } from '@/features/search/types/searchResultCardActions';

type CommonTrackingStatus = 'PLAN_TO_WATCH' | 'COMPLETED';
type AddAction = 'ADD' | 'DONE' | null;

export const SearchResultCardActions: FC<SearchResultCardActionsProps> = ({ id, mediaType }) => {
  const router = useRouter();
  const [isMediaAddPending, startMediaAddTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<AddAction>(null);

  const handleWatch = (action: Exclude<AddAction, null>, trackingStatus?: CommonTrackingStatus) => {
    setPendingAction(action);

    startMediaAddTransition(async () => {
      const result = await addMediaAction({
        tmdbId: id,
        mediaType,
        trackingStatus,
      });

      if (!result.success) {
        toast.error(result.error);
        setPendingAction(null);
        return;
      }

      toast.success('Added to your library');
      setPendingAction(null);
      router.refresh();
    });
  };

  const isAddPending = isMediaAddPending && pendingAction === 'ADD';
  const isDonePending = isMediaAddPending && pendingAction === 'DONE';

  return (
    <div className="grid w-full grid-cols-2 gap-1 rounded-full border border-white/8 bg-white/4 p-1">
      <button
        aria-busy={isAddPending}
        disabled={isMediaAddPending}
        onClick={() => handleWatch('ADD')}
        className="apple-pill-btn flex cursor-pointer items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] text-zinc-200 hover:bg-white/10 aria-busy:cursor-wait aria-busy:opacity-80"
        title="Track as Watching"
      >
        {isAddPending ? (
          <IconLoader2 size={14} className="animate-spin text-violet-400" />
        ) : (
          <IconPlus size={14} className="shrink-0 text-violet-400" />
        )}
        <span>Add</span>
      </button>

      <button
        aria-busy={isDonePending}
        disabled={isMediaAddPending}
        onClick={() => handleWatch('DONE', 'COMPLETED')}
        className="apple-pill-btn flex cursor-pointer items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] text-zinc-200 hover:bg-white/10 aria-busy:cursor-wait aria-busy:opacity-80"
        title="Mark Completed"
      >
        {isDonePending ? (
          <IconLoader2 size={14} className="animate-spin text-violet-400" />
        ) : (
          <IconCircleCheck size={14} className="shrink-0 text-violet-400" />
        )}
        <span>Done</span>
      </button>
    </div>
  );
};
