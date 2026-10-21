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
const FALLBACK_OG_IMAGE = '/icons/logo.png';

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
        images: [{ url: `${baseUrl}${FALLBACK_OG_IMAGE}`, width: 1024, height: 1024 }],
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
  const isPoster = Boolean(posterUrl);
  // Telegram needs an absolute, publicly reachable image. Fall back to the
  // app logo when TMDB has no poster (or the lookup failed) so a preview is
  // always available.
  const ogImage = posterUrl ?? `${baseUrl}${FALLBACK_OG_IMAGE}`;

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
      images: [
        {
          url: ogImage,
          width: isPoster ? 500 : 1024,
          height: isPoster ? 750 : 1024,
          alt: preview?.name ?? trimmed,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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
