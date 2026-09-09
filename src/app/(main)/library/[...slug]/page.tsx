import type { MediaType } from '@/types/media';
import { LibraryMovieDetails, LibraryShowDetails } from '@/features/library';
import { getFreshTrackedShow, getShowCredits, getSimilarShows } from '@/features/show';
import { getMovieCredits, getSimilarMovies, getTrackedMovie } from '@/features/movie';

type LibraryItemParams = {
  slug: [MediaType, string];
};

const LibraryItemPage = async ({ params }: { params: Promise<LibraryItemParams> }) => {
  const { slug } = await params;

  const id = slug[1];
  const mediaType = slug[0];

  if (mediaType === 'movie') {
    const [movie, credits, similarMovies] = await Promise.all([
      getTrackedMovie(id),
      getMovieCredits(id),
      getSimilarMovies(id)]);

    if (movie)
      return <LibraryMovieDetails movie={movie} credits={credits} similarMovies={similarMovies} />;
  }

  if (mediaType === 'tv') {
    const [show, credits, similarShows] = await Promise.all([
      getFreshTrackedShow(id),
      getShowCredits(id),
      getSimilarShows(id),
    ]);

    if (show)
      return <LibraryShowDetails show={show} credits={credits} similarShows={similarShows} />;
  }
};

export default LibraryItemPage;
