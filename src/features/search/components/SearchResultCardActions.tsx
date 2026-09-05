'use client';

import { IconCircleCheck, IconLoader2, IconPlus } from '@tabler/icons-react';
import { FC, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { addMediaAction } from '@/features/library/actions/addMediaAction';
import { SearchResultCardActionsProps } from '@/features/search/types/searchResultCardActions';

type CommonTrackingStatus = 'PLAN_TO_WATCH' | 'COMPLETED';

export const SearchResultCardActions: FC<SearchResultCardActionsProps> = ({ id, mediaType }) => {
  const router = useRouter();
  const [isMediaAddPending, startMediaAddTransition] = useTransition();

  const handleWatch = (trackingStatus?: CommonTrackingStatus) => {
    startMediaAddTransition(async () => {
      const result = await addMediaAction({
        tmdbId: id,
        mediaType,
        trackingStatus,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Added to your library');
      router.refresh();
    });
  };

  return (
    <div className="grid w-full grid-cols-2 gap-1 rounded-full border border-white/8 bg-white/4 p-1">
      <button
        aria-busy={isMediaAddPending}
        onClick={() => handleWatch()}
        className="apple-pill-btn flex cursor-pointer items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] text-zinc-200 hover:bg-white/10 aria-busy:cursor-wait aria-busy:opacity-80"
        title="Track as Watching"
      >
        {isMediaAddPending ? (
          <IconLoader2 size={14} className="animate-spin text-violet-400" />
        ) : (
          <IconPlus size={14} className="shrink-0 text-violet-400" />
        )}
        <span>Add</span>
      </button>

      <button
        aria-busy={isMediaAddPending}
        onClick={() => handleWatch('COMPLETED')}
        className="apple-pill-btn flex cursor-pointer items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] text-zinc-200 hover:bg-white/10 aria-busy:cursor-wait aria-busy:opacity-80"
        title="Mark Completed"
      >
        {isMediaAddPending ? (
          <IconLoader2 size={14} className="animate-spin text-violet-400" />
        ) : (
          <IconCircleCheck size={14} className="shrink-0 text-violet-400" />
        )}
        <span>Done</span>
      </button>
    </div>
  );
};
