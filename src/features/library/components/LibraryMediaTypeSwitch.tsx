'use client';

import { useQueryString } from '@/features/library/hooks/useQueryString';
import { IconDeviceTv, IconMovie } from '@tabler/icons-react';

export const LibraryMediaTypeSwitch = () => {
  const { searchParams, createQueryString } = useQueryString();
  const typeFilter = searchParams.get('type') || 'tv';

  return (
    <div className="flex items-center justify-between pt-1">
      <div className="flex shrink-0 gap-1 rounded-full border border-white/8 bg-zinc-900/90 p-1 shadow-md select-none">
        <button
          type="button"
          onClick={() => createQueryString('type', 'tv')}
          className={`apple-pill-btn flex cursor-pointer items-center gap-2 px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-150 ${
            typeFilter === 'tv'
              ? 'bg-white font-bold text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:bg-white/4 hover:text-white'
          }`}
        >
          <IconDeviceTv
            size={15}
            className={typeFilter === 'tv' ? 'text-zinc-950' : 'text-violet-400'}
          />
          <span>TV Series</span>
        </button>

        <button
          type="button"
          onClick={() => createQueryString('type', 'movie')}
          className={`apple-pill-btn flex cursor-pointer items-center gap-2 px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-150 ${
            typeFilter === 'movie'
              ? 'bg-white font-bold text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:bg-white/4 hover:text-white'
          }`}
        >
          <IconMovie
            size={15}
            className={typeFilter === 'movie' ? 'text-zinc-950' : 'text-violet-400'}
          />
          <span>Movies</span>
        </button>
      </div>
    </div>
  );
};
