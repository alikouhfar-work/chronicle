'use client';

import { IconBookmark, IconCircleCheck, IconPlus } from '@tabler/icons-react';
import { addMediaAction } from '@/features/library/actions/addMediaAction';
import { FC, useTransition } from 'react';
import { SearchResultCardActionsProps } from '@/features/search/types/searchResultCardActions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const SearchResultCardActions: FC<SearchResultCardActionsProps> = ({ id, mediaType }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleWatch = () => {
    startTransition(async () => {
      const result = await addMediaAction({ tmdbId: id, mediaType });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Added to your library');
      router.refresh();
    });
  };

  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-full border border-white/8 bg-white/4 p-1">
      <button
        aria-busy={isPending}
        onClick={handleWatch}
        className="apple-pill-btn flex items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] text-zinc-200 hover:bg-white/10"
        title="Track as Watching"
      >
        <IconPlus size={11} className="shrink-0 text-violet-400" />
        <span>Watch</span>
      </button>
      <button
        // onClick={() => handleAddMovie(item, 'Plan to Watch')}
        className="apple-pill-btn flex items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] text-zinc-200 hover:bg-white/10"
        title="Plan to Watch"
      >
        <IconBookmark size={11} className="shrink-0 text-indigo-400" />
        <span>Queue</span>
      </button>
      <button
        // onClick={() => handleAddMovie(item, 'Completed')}
        className="apple-pill-btn flex items-center justify-center gap-1 rounded-full px-1 py-1 text-[10px] text-zinc-200 hover:bg-white/10"
        title="Mark Completed"
      >
        <IconCircleCheck size={11} className="shrink-0 text-violet-300" />
        <span>Done</span>
      </button>
    </div>
  );
};
