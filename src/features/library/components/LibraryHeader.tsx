'use client'

import { IconArrowsUpDown, IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { typeFilters } from '@/app/(main)/library/_lib/typeFilters';
import { statusFilters } from '@/app/(main)/library/_lib/statusFilters';

export const LibraryHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const typeFilter = searchParams.get('type') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const sortFilter = searchParams.get('sort') || 'recent';
  // const skip = Number(searchParams.get('skip'));
  // const take = Number(searchParams.get('take'));
  // const currentPage = skip / take;

  const createQueryString = useCallback(
    (name: string | Record<string, string | number>, value?: string | number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (typeof name === 'string') {
        params.set(name, String(value));
      } else {
        Object.entries(name).forEach(([key, val]) => {
          params.set(key, String(val));
        });
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!searchQuery) return;
    const timeout = setTimeout(() => {
      createQueryString('search', searchQuery);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchQuery, createQueryString]);

  return (
    <div className="border-zinc-850/80 relative flex flex-col gap-5 overflow-hidden rounded-2xl border bg-zinc-900/60 p-5 shadow-xl backdrop-blur-md md:p-6">
      {/* Decorative corner ambient glow */}
      <div className="bg-gold-500/5 pointer-events-none absolute -top-12 -left-12 h-24 w-24 rounded-full blur-3xl" />

      {/* Search & Sort Row */}
      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="group relative flex-1">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search your library..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hover:border-zinc-750 focus:border-gold-400/80 focus:ring-gold-400/20 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-4 py-2.5 pl-11 font-sans text-xs text-zinc-100 placeholder-zinc-600 transition-all focus:ring-1 focus:outline-none"
          />
          <IconSearch
            className="group-focus-within:text-gold-400 absolute top-3 left-4 text-zinc-500 transition-colors"
            size={14}
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 self-end font-mono text-[11px] md:self-auto">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-zinc-500 uppercase">
            <IconArrowsUpDown size={12} className="text-gold-400" />
            Sort By:
          </span>
          <div className="relative">
            <select
              value={sortFilter}
              onChange={(e) => createQueryString('sort', e.target.value)}
              className="hover:border-zinc-750 focus:border-gold-400 cursor-pointer appearance-none rounded-xl border border-zinc-800/80 bg-zinc-950 px-4 py-2.5 pr-8 text-xs text-zinc-300 transition-colors focus:outline-none"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Title A-Z</option>
              <option value="year">Release Year</option>
            </select>
            {/* Custom select chevron */}
            <div className="pointer-events-none absolute top-3.5 right-3 text-[8px] font-bold text-zinc-500">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="border-zinc-850/60 relative z-10 flex flex-col justify-between gap-4 border-t pt-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <span className="font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Type
          </span>
          <div className="border-zinc-850 flex w-full gap-1 rounded-xl border bg-zinc-950/80 p-1 sm:w-auto">
            {typeFilters.map((type) => (
              <button
                key={type.id}
                onClick={() => createQueryString('type', type.id)}
                className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-center font-mono text-[11px] tracking-wider uppercase transition-all duration-300 sm:flex-initial ${
                  typeFilter === type.id
                    ? 'bg-gold-400 shadow-gold-500/10 font-bold text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                {type.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <span className="font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Status
          </span>
          <div className="border-zinc-850 flex flex-wrap gap-1 rounded-xl border bg-zinc-950/80 p-1">
            {statusFilters.map((status) => {
              const isSelected = statusFilter === status.id;

              return (
                <button
                  key={status.id}
                  onClick={() => createQueryString('status', status.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-[10px] tracking-wider uppercase transition-all duration-300 ${
                    isSelected
                      ? 'bg-zinc-100 font-bold text-zinc-950 shadow-md shadow-white/5'
                      : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                  }`}
                >
                  {status.id !== 'all' && (
                    <span className={`h-1.5 w-1.5 rounded-full ${status.indicatorColor}`} />
                  )}
                  {status.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
