import type { MediaType } from '@/types/media';
import { LibraryMovieDetails, LibraryShowDetails } from '@/features/library';
import { getFreshTrackedShow, getShowCredits } from '@/features/show';
import { getMovieCredits, getTrackedMovie } from '@/features/movie';

type LibraryItemParams = {
  slug: [MediaType, string];
};

const LibraryItemPage = async ({ params }: { params: Promise<LibraryItemParams> }) => {
  const { slug } = await params;

  const id = slug[1];
  const mediaType = slug[0];

  if (mediaType === 'movie') {
    const [movie, credits] = await Promise.all([getTrackedMovie(id), getMovieCredits(id)]);
    if (movie) return <LibraryMovieDetails movie={movie} credits={credits} />;
  }

  if (mediaType === 'tv') {
    const [show, credits] = await Promise.all([getFreshTrackedShow(id), getShowCredits(id)]);
    if (show) return <LibraryShowDetails show={show} credits={credits} />;
  }
};

export default LibraryItemPage;
