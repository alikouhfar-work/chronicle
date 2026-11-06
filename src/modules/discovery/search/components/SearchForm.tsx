import { IconSearch } from '@tabler/icons-react';
import type { SearchFormProps } from '@/modules/discovery/search/types/searchForm';

export const SearchForm = ({ query }: SearchFormProps) => {
  return (
    <section>
      <form action="/search" method="GET" className="relative mx-auto flex max-w-2xl items-center">
        <input
          type="text"
          name="query"
          defaultValue={query}
          aria-label="Search movies and shows"
          placeholder="Search by title (e.g. Proud, Fellow Travelers...)"
          className="w-full rounded-pill border border-line-control bg-surface-soft px-5 py-3.5 pl-12 text-base font-medium text-ink placeholder:text-ink-subtle shadow-2xl transition-all hover:border-line-strong focus:border-accent-ink focus-visible:ring-2 focus:ring-accent/40 focus:outline-none sm:text-sm"
        />
        <IconSearch aria-hidden className="absolute left-4.5 text-ink-muted" size={18} />
        <button
          type="submit"
          className="apple-pill-btn absolute right-2 flex cursor-pointer items-center gap-1.5 bg-accent px-5 py-2 text-xs font-bold text-ink shadow-card shadow-accent/25 transition-all hover:bg-accent-strong"
        >
          Search
        </button>
      </form>
    </section>
  );
};
