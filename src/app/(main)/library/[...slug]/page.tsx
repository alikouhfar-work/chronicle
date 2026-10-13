import { notFound } from 'next/navigation';
import type { MediaType } from '@/shared/types/media';
import { LibraryDetails } from '@/modules/library';
import { getTrackedMovie } from '@/modules/movie/queries/getTrackedMovie';
import { getMovieCredits } from '@/modules/movie/queries/getMovieCredits';
import { getSimilarMovies } from '@/modules/movie/queries/getSimilarMovies';
import { getFreshTrackedShow } from '@/modules/show/queries/getFreshTrackedShow';
import { getShowCredits } from '@/modules/show/queries/getShowCredits';
import { getSimilarShows } from '@/modules/show/queries/getSimilarShows';
import type { LibraryDetailsPageProps } from '@/modules/library/types/libraryDetailsPage';

import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const isValidSlug = (slug: unknown): slug is [MediaType, string] =>
  Array.isArray(slug) &&
  slug.length === 2 &&
  (slug[0] === 'movie' || slug[0] === 'tv') &&
  typeof slug[1] === 'string' &&
  slug[1].length > 0;

export const generateMetadata = async ({
  params,
}: LibraryDetailsPageProps): Promise<Metadata> => {
  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) return {};
    const [mediaType, id] = slug;

    const media = mediaType === 'movie' ? await getTrackedMovie(id) : await getFreshTrackedShow(id);
    if (!media) return {};

    const title = media.name;
    return {
      title,
      description: media.overview ?? `Details and similar titles for ${title}.`,
      openGraph: {
        title,
        description: media.overview ?? undefined,
        images: media.posterPath
          ? [{ url: `${process.env.TMDB_IMAGE_BASE_URL}/w500${media.posterPath}` }]
          : undefined,
      },
    };
  } catch {
    return {};
  }
};

const LibraryDetailsPage = async ({ params }: LibraryDetailsPageProps) => {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const [mediaType, id] = slug;

  if (mediaType === 'movie') {
    let movie;
    let credits;
    let similarMovies;
    try {
      [movie, credits, similarMovies] = await Promise.all([
        getTrackedMovie(id),
        getMovieCredits(id),
        getSimilarMovies(id),
      ]);
    } catch (error) {
      throw error;
    }

    if (!movie) notFound();

    return (
      <LibraryDetails
        media={movie}
        mediaType="movie"
        credits={credits}
        similarMedia={similarMovies}
      />
    );
  }

  let show;
  let tvCredits;
  let similarShows;
  try {
    [show, tvCredits, similarShows] = await Promise.all([
      getFreshTrackedShow(id),
      getShowCredits(id),
      getSimilarShows(id),
    ]);
  } catch (error) {
    throw error;
  }

  if (!show) notFound();

  return (
    <LibraryDetails media={show} mediaType="tv" credits={tvCredits} similarMedia={similarShows} />
  );
};

export default LibraryDetailsPage;