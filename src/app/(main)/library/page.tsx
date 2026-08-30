import {
  LibraryFilters,
  LibraryHeader,
  LibraryMediaTypeSwitch,
  LibraryMovies,
  type LibraryPageProps,
  LibrarySectionLoading,
  LibraryShows,
} from '@/features/library';
import { FC, Suspense } from 'react';

const LibraryPage: FC<LibraryPageProps> = async ({ searchParams }) => {
  const { type = 'tv', status = 'all', sort = 'recent', search } = await searchParams;
  const showTv = type === 'tv';
  const showMovie = type === 'movie' && status !== 'dropped';

  return (
    <article className="animate-fade-in space-y-8 font-sans">
      <LibraryHeader />
      <LibraryFilters />
      <LibraryMediaTypeSwitch />
      {showTv && (
        <Suspense fallback={<LibrarySectionLoading />}>
          <LibraryShows sort={sort} status={status} search={search} />
        </Suspense>
      )}
      {showMovie && (
        <Suspense fallback={<LibrarySectionLoading />}>
          <LibraryMovies sort={sort} status={status} search={search} />
        </Suspense>
      )}
    </article>
  );
};

export default LibraryPage;
