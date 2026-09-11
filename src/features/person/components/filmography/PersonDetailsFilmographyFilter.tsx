'use client'

import { FC, useState } from 'react';
import { CombinedCredit } from '@/features/person/types/combinedCredit';
import {
  IconAdjustmentsHorizontal,
  IconDeviceTv,
  IconMovie,
  IconSearch,
} from '@tabler/icons-react';
import { useQueryString } from '@/features/library/hooks/useQueryString';

export type PersonDetailsCombinedCreditsFilterProps = {
  combinedCredits: CombinedCredit[];
};

export const PersonDetailsFilmographyFilter: FC<PersonDetailsCombinedCreditsFilterProps> = ({
  combinedCredits,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchParams, createQueryString } = useQueryString();

  const typeFilter = searchParams.get('type') || 'all';
  const sortFilter = searchParams.get('sort') || 'recent';

  const movieCount = combinedCredits.filter((c) => c.mediaType === 'movie').length;
  const tvCount = combinedCredits.filter((c) => c.mediaType === 'tv').length;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search within credits */}
      <div className="relative">
        <IconSearch size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter works..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-36 rounded-full border border-white/10 bg-zinc-900 py-1.5 pr-3 pl-8 text-xs text-zinc-200 transition-colors placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none sm:w-44"
        />
      </div>

      {/* Media Type Filter Pills */}
      <div className="flex items-center rounded-full border border-white/10 bg-zinc-900/90 p-1">
        <button
          onClick={() => createQueryString('type', 'all')}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            typeFilter === 'all'
              ? 'bg-violet-500 font-bold text-white shadow-sm shadow-violet-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All ({combinedCredits.length})
        </button>
        <button
          onClick={() => createQueryString('type', 'movie')}
          className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            typeFilter === 'movie'
              ? 'bg-violet-500 font-bold text-white shadow-sm shadow-violet-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <IconMovie size={11} />
          <span>Movies ({movieCount})</span>
        </button>
        <button
          onClick={() => createQueryString('type', 'tv')}
          className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            typeFilter === 'tv'
              ? 'bg-violet-500 font-bold text-white shadow-sm shadow-violet-500/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <IconDeviceTv size={11} />
          <span>Series ({tvCount})</span>
        </button>
      </div>

      {/* Sort Filter Selector */}
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
        <IconAdjustmentsHorizontal size={11} className="text-zinc-500" />
        <select
          value={sortFilter}
          onChange={(e) => createQueryString('sort', e.target.value)}
          className="cursor-pointer bg-transparent text-xs font-semibold text-zinc-300 focus:outline-none"
        >
          <option value="year" className="bg-zinc-900 text-zinc-200">
            Newest First
          </option>
          <option value="rating" className="bg-zinc-900 text-zinc-200">
            Highest Rated
          </option>
          <option value="popularity" className="bg-zinc-900 text-zinc-200">
            Popularity
          </option>
        </select>
      </div>
    </div>
  );
};
