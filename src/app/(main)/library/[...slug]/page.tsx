import type { MediaType } from '@/types/media';
import { getFreshTrackedShow, getShowCredits, getSimilarShows } from '@/features/show';
import { getMovieCredits, getSimilarMovies, getTrackedMovie } from '@/features/movie';
import { LibraryDetails } from '@/features/library';

type LibraryDetailsParams = {
  slug: [MediaType, string];
};

const LibraryDetailsPage = async ({ params }: { params: Promise<LibraryDetailsParams> }) => {
  const { slug } = await params;

  const id = slug[1];
  const mediaType = slug[0];

  if (mediaType === 'movie') {
    const [movie, credits, similarMovies] = await Promise.all([
      getTrackedMovie(id),
      getMovieCredits(id),
      getSimilarMovies(id),
    ]);

    if (movie)
      return <LibraryDetails media={movie} credits={credits} similarMedia={similarMovies} />;
  }

  if (mediaType === 'tv') {
    const [show, credits, similarShows] = await Promise.all([
      getFreshTrackedShow(id),
      getShowCredits(id),
      getSimilarShows(id),
    ]);

    if (show) return <LibraryDetails media={show} credits={credits} similarMedia={similarShows} />;
  }
};

export default LibraryDetailsPage;
