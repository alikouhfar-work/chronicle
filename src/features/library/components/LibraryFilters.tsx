'use client';

import { IconArrowsUpDown, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { statusFilters } from '@/features/library/lib/statusFilters';
import { useQueryString } from '@/features/library/hooks/useQueryString';

export const LibraryFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchParams, createQueryString } = useQueryString();

  const typeFilter = searchParams.get('type') || 'tv';
  const sortFilter = searchParams.get('sort') || 'recent';
  const statusFilter = searchParams.get('status') || 'all';

  const clearFilters = () => {
    setSearchQuery('');
    createQueryString({
      search: '',
      status: 'all',
      sort: 'recent',
      type: 'tv',
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      createQueryString('search', searchQuery);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchQuery, createQueryString]);

  return (
    <div className="glass-card flex flex-col gap-4 rounded-2xl border border-white/8 p-5 shadow-xl md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="group relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              typeFilter === 'tv'
                ? 'Filter series by title or genre...'
                : 'Filter movies by title or genre...'
            }
            className="w-full rounded-full border border-white/8 bg-white/4 px-4 py-2.5 pr-10 pl-10 text-xs font-medium text-white placeholder-zinc-500 transition-all hover:border-white/20 focus:ring-2 focus:ring-violet-400/20 focus:outline-none"
          />
          <IconSearch
            className="absolute top-3 left-3.5 text-zinc-400 transition-colors group-focus-within:text-violet-400"
            size={15}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute top-2.5 right-3 rounded-full p-1 text-zinc-400 transition-colors hover:text-white"
            >
              <IconX size={13} />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end text-xs md:self-auto">
          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <IconArrowsUpDown size={13} className="text-violet-400" />
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortFilter}
              onChange={(e) => createQueryString('sort', e.target.value)}
              className="cursor-pointer appearance-none rounded-full border border-white/10 bg-white/6 px-3.5 py-2 pr-7 text-xs font-medium text-zinc-200 transition-colors hover:border-white/20 focus:outline-none"
            >
              <option value="recent" className="bg-zinc-900 text-white">
                Recently Added
              </option>
              <option value="title" className="bg-zinc-900 text-white">
                Title A-Z
              </option>
              <option value="year" className="bg-zinc-900 text-white">
                Release Year
              </option>
              {/*{typeFilter === 'tv' && (*/}
              {/*  <option value="progress" className="bg-zinc-900 text-white">*/}
              {/*    Watch Progress*/}
              {/*  </option>*/}
              {/*)}*/}
              {/*{typeFilter === 'movie' && (*/}
              {/*  <option value="rating" className="bg-zinc-900 text-white">*/}
              {/*    Rating (Highest)*/}
              {/*  </option>*/}
              {/*)}*/}
            </select>
            <div className="pointer-events-none absolute top-3 right-2.5 text-[9px] text-zinc-400">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-col justify-between gap-3 border-t border-white/6 pt-3 sm:flex-row sm:items-center">
        {searchQuery || statusFilter !== 'all' ? (
          <button
            onClick={clearFilters}
            className="flex cursor-pointer items-center gap-1.5 self-start text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline sm:self-auto"
          >
            <IconX size={13} />
            <span>Reset Filters</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="mr-1 text-xs font-medium text-zinc-400">Status:</span>
          <div className="flex flex-wrap gap-1 rounded-[20px] border border-white/8 bg-zinc-900/90 p-1 sm:rounded-full">
            {statusFilters.map((status) => {
              const isSelected = statusFilter === status.id;

              return (
                <button
                  key={status.id}
                  onClick={() => createQueryString('status', status.id)}
                  className={`apple-pill-btn flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-150 ${
                    isSelected
                      ? 'bg-white font-bold text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${status.indicatorColor}`} />
                  <span>{status.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
