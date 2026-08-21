import {
  SearchForm,
  SearchHeader,
  SearchPageProps,
  SearchResultList,
  SearchResultLoading,
} from '@/features/search';
import { FC, Suspense } from 'react';

const SearchPage: FC<SearchPageProps> = async ({ searchParams }) => {
  const { query } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <article className="animate-fade-in mx-auto max-w-4xl space-y-8">
        <SearchHeader />
        <SearchForm query={query} />
        <Suspense fallback={<SearchResultLoading />}>
          <SearchResultList query={query} />
        </Suspense>
      </article>
    </main>
  );
};

export default SearchPage;
