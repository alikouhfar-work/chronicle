import { CombinedCredit, CreditShowRaw } from '@/features/person/types/combinedCredit';

export const mapCreditShows = (
  creditShow: CreditShowRaw,
  genreDictionary: Map<number, string>,
): Omit<CombinedCredit, 'isTracked'> => ({
  posterPath: creditShow.poster_path,
  id: creditShow.id,
  name: creditShow.name,
  overview: creditShow.overview,
  mediaType: creditShow.media_type,
  releaseDate: creditShow.first_air_date,
  popularity: creditShow.popularity,
  character: creditShow.character,
  creditId: creditShow.credit_id,
  rating: creditShow.vote_average,
  voteCount: creditShow.vote_count,
  genres: creditShow.genre_ids
    .map((id) => {
      const name = genreDictionary.get(id);
      return name ? { id, name } : null;
    })
    .filter((genre): genre is { id: number; name: string } => genre !== null),
});
