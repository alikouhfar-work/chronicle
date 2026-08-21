import {
  LibraryHeader,
  LibraryMovies,
  type LibraryPageProps,
  LibrarySectionLoading,
  LibraryShows,
} from '@/features/library';
import { FC, Suspense } from 'react';

const LibraryPage: FC<LibraryPageProps> = async ({ searchParams }) => {
  const { type = 'all', status = 'all', sort = 'recent' } = await searchParams;
  const showTv = type === 'tv' || type === 'all';
  const showMovie = (type === 'movie' || type === 'all') && status !== 'dropped';

  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-6 px-4 py-8 font-sans sm:px-6 lg:px-8">
      <LibraryHeader />
      <div className="space-y-12">
        {showTv && (
          <Suspense fallback={<LibrarySectionLoading />}>
            <LibraryShows sort={sort} status={status} />
          </Suspense>
        )}
        {showMovie && (
          <Suspense fallback={<LibrarySectionLoading />}>
            <LibraryMovies sort={sort} status={status} />
          </Suspense>
        )}
      </div>
    </article>
  );
};

export default LibraryPage;
