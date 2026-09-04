import { IconSearch } from '@tabler/icons-react';
import React, { FC } from 'react';
import { SearchFormProps } from '@/features/search/types/searchForm';

export const SearchForm: FC<SearchFormProps> = ({ query }) => {
  return (
    <section>
      <form action="/search" method="GET" className="relative mx-auto flex max-w-2xl items-center">
        <input
          type="text"
          name="query"
          defaultValue={query}
          placeholder="Search by title (e.g., Dune, Oppenheimer, Shōgun...)"
          className="w-full rounded-full border border-white/10 bg-white/6 px-5 py-3.5 pl-12 text-xs font-medium text-white placeholder-zinc-500 shadow-2xl transition-all hover:border-white/20 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 focus:outline-none sm:text-sm"
        />
        <IconSearch className="absolute left-4.5 text-zinc-400" size={18} />
        <button
          type="submit"
          className="apple-pill-btn absolute right-2 flex cursor-pointer items-center gap-1.5 bg-violet-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:bg-violet-400"
        >
          Search
        </button>
      </form>
    </section>
  );
};
