import { notFound } from 'next/navigation';
import type { MediaType } from '@/types/media';
import { LibraryDetails } from '@/features/library';
import { getTrackedShows } from '@/features/show/queries/getTrackedShows';
import { getTrackedMovies } from '@/features/movie/queries/getTrackedMovies';
import { getTrackedMovie } from '@/features/movie/queries/getTrackedMovie';
import { getMovieCredits } from '@/features/movie/queries/getMovieCredits';
import { getSimilarMovies } from '@/features/movie/queries/getSimilarMovies';
import { getFreshTrackedShow } from '@/features/show/queries/getFreshTrackedShow';
import { getShowCredits } from '@/features/show/queries/getShowCredits';
import { getSimilarShows } from '@/features/show/queries/getSimilarShows';
import { Metadata } from 'next';

type LibraryDetailsParams = {
  slug: [MediaType, string];
};

export const revalidate = 3600;
export const dynamicParams = true;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LibraryDetailsParams>;
}): Promise<Metadata> => {
  const { slug } = await params;
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
};

export async function generateStaticParams(): Promise<LibraryDetailsParams[]> {
  const [movies, shows] = await Promise.all([getTrackedMovies(), getTrackedShows()]);

  return [
    ...movies.map((movie) => ({ slug: ['movie', movie.tmdbId.toString()] as [MediaType, string] })),
    ...shows.map((show) => ({ slug: ['tv', show.tmdbId.toString()] as [MediaType, string] })),
  ];
}

const LibraryDetailsPage = async ({ params }: { params: Promise<LibraryDetailsParams> }) => {
  const { slug } = await params;
  const [mediaType, id] = slug;

  if (mediaType === 'movie') {
    const [movie, credits, similarMovies] = await Promise.all([
      getTrackedMovie(id),
      getMovieCredits(id),
      getSimilarMovies(id),
    ]);

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

  if (mediaType === 'tv') {
    const [show, credits, similarShows] = await Promise.all([
      getFreshTrackedShow(id),
      getShowCredits(id),
      getSimilarShows(id),
    ]);

    console.log(show)

    if (!show) notFound();

    return (
      <LibraryDetails media={show} mediaType="tv" credits={credits} similarMedia={similarShows} />
    );
  }

  notFound();
};

export default LibraryDetailsPage;
