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
          placeholder="Search (e.g., Succession, Severance, Interstellar, Dune...)"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3.5 pl-12 text-sm text-zinc-100 placeholder-zinc-500 shadow-lg transition-all focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none"
        />

        <IconSearch className="absolute left-4 text-zinc-500" size={18} />

        <button
          type="submit"
          className="absolute right-2.5 flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow transition-all hover:bg-indigo-500"
        >
          Search
        </button>
      </form>
    </section>
  );
};
