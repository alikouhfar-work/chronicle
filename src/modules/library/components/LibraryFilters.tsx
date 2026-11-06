'use client';

import { IconArrowsUpDown, IconSearch, IconX } from '@tabler/icons-react';
import { useOptimistic, useEffect, useState, useTransition } from 'react';
import { statusFilters } from '@/modules/library/lib/statusFilters';
import { useQueryString } from '@/shared/hooks/useQueryString';

export const LibraryFilters = () => {
  const { searchParams, createQueryString } = useQueryString();
  // useOptimistic setters must run inside a transition or action — calling
  // them directly logs "An optimistic state update occurred outside a
  // transition or action". The router.replace navigation itself stays
  // urgent (see useQueryString) so <Suspense> shows the skeleton natively.
  const [, startTransition] = useTransition();

  const urlSearch = searchParams.get('search') ?? '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  const typeFilter = searchParams.get('type') || 'tv';
  const sortFilter = searchParams.get('sort') || 'recent';
  const statusFilter = searchParams.get('status') || 'all';

  // Optimistic status selection: the URL update via router.replace can lag
  // on slow networks, so reflect the tapped filter immediately and sync
  // back when the URL catches up (including browser back/forward, which
  // changes the URL without going through selectStatus).
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(statusFilter);

  useEffect(() => {
    startTransition(() => {
      setOptimisticStatus(statusFilter);
    });
  }, [statusFilter, setOptimisticStatus, startTransition]);

  const selectStatus = (statusId: string) => {
    startTransition(() => {
      setOptimisticStatus(statusId);
    });
    createQueryString('status', statusId);
  };

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
    if (searchQuery === urlSearch) return;

    const timeout = setTimeout(() => {
      createQueryString('search', searchQuery);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery, urlSearch, createQueryString]);

  return (
    <div className="glass-card flex flex-col gap-4 rounded-card border border-line p-5 shadow-xl md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="group relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter library by title"
            placeholder={
              typeFilter === 'tv'
                ? 'Filter series by title or genre...'
                : 'Filter movies by title or genre...'
            }
            className="w-full rounded-pill border border-line-control bg-surface-soft px-4 py-2.5 pr-10 pl-10 text-base font-medium text-ink placeholder:text-ink-subtle transition-all hover:border-line-strong focus-visible:ring-2 focus:ring-accent/40 focus:outline-none sm:text-xs"
          />
          <IconSearch
            className="absolute top-3 left-3.5 text-ink-muted transition-colors group-focus-within:text-accent-ink"
            size={15}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute top-2.5 right-3 rounded-pill p-1 text-ink-muted transition-colors hover:text-ink"
            >
              <IconX size={13} />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end text-xs md:self-auto">
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <IconArrowsUpDown size={13} className="text-accent-ink" />
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortFilter}
              onChange={(e) => createQueryString('sort', e.target.value)}
              aria-label="Sort library"
              className="cursor-pointer appearance-none rounded-pill border border-line bg-surface-soft px-3.5 py-2 pr-7 text-base font-medium text-ink-secondary transition-colors hover:border-line-strong focus-visible:ring-2 focus:ring-accent/40 focus:outline-none sm:text-xs"
            >
              <option value="recent" className="bg-surface-raised text-ink">
                Recently Added
              </option>
              <option value="title" className="bg-surface-raised text-ink">
                Title A-Z
              </option>
              <option value="year" className="bg-surface-raised text-ink">
                Release Year
              </option>
            </select>
            <div className="pointer-events-none absolute top-3 right-2.5 text-micro text-ink-muted">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-col justify-between gap-3 border-t border-line pt-3 sm:flex-row sm:items-center">
        {searchQuery || statusFilter !== 'all' ? (
          <button
            onClick={clearFilters}
            className="flex cursor-pointer items-center gap-1.5 self-start text-xs font-medium text-accent-ink hover:text-accent-ink hover:underline sm:self-auto"
          >
            <IconX size={13} />
            <span>Reset Filters</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="mr-1 text-xs font-medium text-ink-muted">Status:</span>
          <div className="flex flex-wrap gap-1 rounded-[20px] border border-line bg-surface-raised/90 p-1 sm:rounded-pill">
            {statusFilters.map((status) => {
              const isSelected = optimisticStatus === status.id;

              return (
                <button
                  key={status.id}
                  onClick={() => selectStatus(status.id)}
                  aria-pressed={isSelected}
                  className={`apple-pill-btn flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-150 ${
                    isSelected
                      ? 'bg-white font-bold text-canvas shadow-card'
                      : 'text-ink-muted hover:bg-surface-soft hover:text-ink'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-pill ${status.indicatorColor}`} />
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
