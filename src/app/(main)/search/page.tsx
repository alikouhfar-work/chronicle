import {
  SearchForm,
  SearchHeader,
  type SearchPageProps,
  SearchResultList,
  SearchResultLoading,
} from '@/modules/discovery/search';
import { Suspense } from 'react';

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { query } = await searchParams;

  return (
    <article className="animate-fade-in mx-auto w-full max-w-7xl space-y-8 px-3 font-sans sm:px-6 lg:px-8">
      <SearchHeader />
      <SearchForm query={query} />
      <Suspense fallback={<SearchResultLoading />}>
        <SearchResultList query={query} />
      </Suspense>
    </article>
  );
};

export default SearchPage;
