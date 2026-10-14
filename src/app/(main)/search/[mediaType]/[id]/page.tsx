import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { MediaType } from '@/shared/types/media';
import { parseTmdbId } from '@/shared/lib/validate';
import { getTitleDetails } from '@/modules/discovery/search/queries/getTitleDetails';
import type { TitleDetailsPageProps } from '@/modules/discovery/search/types/titleDetails';
import { TitleDetailsView } from '@/modules/discovery/search/components/TitleDetailsView';
import { getMovieCredits } from '@/modules/movie/queries/getMovieCredits';
import { getShowCredits } from '@/modules/show/queries/getShowCredits';
import { getSimilarMovies } from '@/modules/movie/queries/getSimilarMovies';
import { getSimilarShows } from '@/modules/show/queries/getSimilarShows';
import { getTrackedMoviesLookup } from '@/modules/movie/queries/getTrackedMoviesLookup';
import { getTrackedShowsLookup } from '@/modules/show/queries/getTrackedShowsLookup';

const isMediaType = (value: string): value is MediaType =>
  value === 'movie' || value === 'tv';

export const generateMetadata = async ({
  params,
}: TitleDetailsPageProps): Promise<Metadata> => {
  const { mediaType, id } = await params;
  if (!isMediaType(mediaType)) return {};
  const details = await getTitleDetails(mediaType, id);
  if (!details) return {};

  return {
    title: `${details.name} (${details.year})`,
    description: details.overview || `Details for ${details.name}.`,
  };
};

const TitleDetailsPage = async ({ params }: TitleDetailsPageProps) => {
  const { mediaType, id } = await params;
  if (!isMediaType(mediaType)) {
    notFound();
  }

  let tmdbId: number;
  try {
    tmdbId = parseTmdbId(id);
  } catch {
    notFound();
  }

  const details = await getTitleDetails(mediaType, id);
  if (!details) {
    notFound();
  }

  const lookup = mediaType === 'movie' ? getTrackedMoviesLookup : getTrackedShowsLookup;
  const [credits, similar, trackedIds] = await Promise.all([
    mediaType === 'movie' ? getMovieCredits(id) : getShowCredits(id),
    mediaType === 'movie' ? getSimilarMovies(id) : getSimilarShows(id),
    lookup([tmdbId]).catch(() => new Set<number>()),
  ]);

  return (
    <TitleDetailsView
      details={details}
      credits={credits}
      similar={similar}
      isTracked={trackedIds.has(tmdbId)}
    />
  );
};

export default TitleDetailsPage;
