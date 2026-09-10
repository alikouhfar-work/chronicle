import { CombinedCredit, CreditMovieRaw } from '@/features/person/types/combinedCredit';

export const mapCreditMovies = (
  creditMovie: CreditMovieRaw,
  genreDictionary: Map<number, string>,
): Omit<CombinedCredit, 'isTracked'> => ({
  posterPath: creditMovie.poster_path,
  id: creditMovie.id,
  name: creditMovie.title,
  overview: creditMovie.overview,
  mediaType: creditMovie.media_type,
  releaseDate: creditMovie.release_date,
  popularity: creditMovie.popularity,
  character: creditMovie.character,
  creditId: creditMovie.credit_id,
  rating: creditMovie.vote_average,
  voteCount: creditMovie.vote_count,
  genres: creditMovie.genre_ids
    .map((id) => {
      const name = genreDictionary.get(id);
      return name ? { id, name } : null;
    })
    .filter((genre): genre is { id: number; name: string } => genre !== null),
});
