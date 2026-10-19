import {
  SearchForm,
  SearchHeader,
  type SearchPageProps,
  SearchResultList,
  SearchResultLoading,
} from '@/modules/discovery/search';
import { getSearchPreview } from '@/modules/discovery/search/queries/getSearchPreview';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { getAppBaseUrl } from '@/shared/lib/appUrl';
import type { Metadata } from 'next';
import { Suspense } from 'react';

const DEFAULT_DESCRIPTION = 'Search movies and TV shows to track on Chronicle.';

export const generateMetadata = async ({
  searchParams,
}: SearchPageProps): Promise<Metadata> => {
  const { query } = await searchParams;
  const trimmed = query?.trim() ?? '';
  const baseUrl = await getAppBaseUrl();

  if (!trimmed) {
    return {
      metadataBase: new URL(baseUrl),
      title: 'Search',
      description: DEFAULT_DESCRIPTION,
      openGraph: {
        type: 'website',
        siteName: 'Chronicle',
        title: 'Search movies and TV shows',
        description: DEFAULT_DESCRIPTION,
        url: `${baseUrl}/search`,
      },
    };
  }

  const preview = await getSearchPreview(trimmed);
  const posterUrl = preview?.posterPath
    ? getTmdbImageUrl(preview.posterPath, 'poster', 'w500')
    : null;

  const shareUrl = `${baseUrl}/search?query=${encodeURIComponent(trimmed)}`;
  const title = preview ? preview.name : `${trimmed} — Search`;
  const description = preview?.overview ?? `Search results for ${trimmed} on Chronicle.`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: { canonical: shareUrl },
    openGraph: {
      type: 'website',
      siteName: 'Chronicle',
      title,
      description,
      url: shareUrl,
      images: posterUrl
        ? [
            {
              url: posterUrl,
              width: 500,
              height: 750,
              alt: preview?.name ?? trimmed,
            },
          ]
        : undefined,
    },
    twitter: {
      card: posterUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: posterUrl ? [posterUrl] : undefined,
    },
  };
};

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
