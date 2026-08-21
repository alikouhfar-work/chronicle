'use client'

import { IconPlus } from '@tabler/icons-react';
import { addMediaAction } from '@/features/library/actions/addMediaAction';
import { useTransition } from 'react';

export const SearchResultCardWatchButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleWatch = () => {
    startTransition(async () => {
      await addMediaAction(tmdbId, mediaType);
    });
  };

  return (
    <button
      onClick={handleWatch}
      disabled={isPending}
      className="group/btn flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/90 px-1 py-1.5 font-mono text-xs font-medium text-zinc-300 shadow-xs transition-all hover:border-amber-500/40 hover:bg-amber-500/20 hover:text-amber-200 hover:shadow-amber-500/10 active:scale-95"
      title="Track as Watching"
    >
      <IconPlus
        size={12}
        className="shrink-0 text-amber-400 transition-transform group-hover/btn:scale-110"
      />
      <span>{isPending ? 'Adding...' : 'Watch'}</span>
    </button>
  );
}