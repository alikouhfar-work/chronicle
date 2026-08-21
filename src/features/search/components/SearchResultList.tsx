import { searchMedia } from '@/features/search/services/searchMedia';
import { SearchResultEmpty } from '@/features/search/components/SearchResultEmpty';
import { SearchResultListProps } from '@/features/search/types/searchResultList';
import { FC } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { SearchResultShowCard } from '@/features/search/components/SearchResultShowCard';
import Link from 'next/link';
import { SearchResultMovieCard } from '@/features/search/components/SearchResultMovieCard';

export const SearchResultList: FC<SearchResultListProps> = async ({ query }) => {
  if (!query?.trim()) {
    return <SearchResultEmpty />;
  }

  const searchResults = await searchMedia(query);

  return (
    <div className="space-y-6">
      <div className="border-zinc-850 flex items-center justify-between border-b pb-3">
        <h3 className="flex items-center gap-2 font-mono text-sm font-bold tracking-wider text-zinc-300 uppercase">
          <IconSparkles size={14} className="text-gold-400" />
          <span>Search Results ({searchResults.length})</span>
        </h3>
        <Link
          href="/search"
          className="cursor-pointer font-mono text-[10px] text-zinc-500 hover:text-zinc-300"
        >
          Clear Results
        </Link>
      </div>

      <div className="smgrid-cols-2 grid gap-4 sm:gap-5 md:grid-cols-3">
        {searchResults.map((result) =>
          result.mediaType === 'tv' ? (
            <SearchResultShowCard key={result.id} {...result} />
          ) : (
            <SearchResultMovieCard key={result.id} {...result} />
          ),
        )}
      </div>
    </div>
  );
};
