'use client';

import { IconCircleCheck, IconPlus } from '@tabler/icons-react';
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
    <div className="grid w-full grid-cols-3 gap-1.5">
      <button
        aria-busy={isPending}
        onClick={handleWatch}
        className="group/btn flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/90 px-1 py-1.5 font-mono text-xs font-medium text-zinc-300 shadow-xs transition-all hover:border-amber-500/40 hover:bg-amber-500/20 hover:text-amber-200 hover:shadow-amber-500/10 active:scale-95 disabled:cursor-not-allowed aria-busy:cursor-wait aria-busy:opacity-70"
        title="Track as Watching"
      >
        <IconPlus
          size={12}
          className="shrink-0 text-amber-400 transition-transform group-hover/btn:scale-110"
        />
        <span>Watch</span>
      </button>
      <button
        // onClick={() => handleAddSeries(item, 'Completed')}
        // disabled={isPending}
        disabled
        className="group/btn flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/90 px-1 py-1.5 font-mono text-xs font-medium text-zinc-300 shadow-xs transition-all hover:border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-200 hover:shadow-emerald-500/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-70"
        title="Mark Completed"
      >
        <IconCircleCheck
          size={12}
          className="shrink-0 text-emerald-400 transition-transform group-hover/btn:scale-110"
        />
        <span>Done</span>
      </button>
    </div>
  );
};
