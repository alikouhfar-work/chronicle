import { searchMedia } from '@/features/search/services/searchMedia';
import { SearchResultListProps } from '@/features/search/types/searchResultList';
import { FC } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { SearchResultShowCard } from '@/features/search/components/SearchResultShowCard';
import Link from 'next/link';
import { SearchResultMovieCard } from '@/features/search/components/SearchResultMovieCard';

export const SearchResultList: FC<SearchResultListProps> = async ({ query }) => {
  if (!query) return;
  const searchResults = await searchMedia(query);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <IconSparkles size={14} className="text-violet-400" />
          <span>Search Results ({searchResults.length})</span>
        </h3>
        <Link
          href="/search"
          className="apple-pill-btn cursor-pointer bg-white/6 px-3.5 py-1 text-xs text-zinc-300 hover:bg-white/12"
        >
          Clear Results
        </Link>
      </div>

      <ul className="grid sm:grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {searchResults.map((result) =>
          result.mediaType === 'tv' ? (
            <SearchResultShowCard key={result.id} {...result} />
          ) : (
            <SearchResultMovieCard key={result.id} {...result} />
          ),
        )}
      </ul>
    </div>
  );
};
