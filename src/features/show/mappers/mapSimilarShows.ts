import { SimilarShow, SimilarShowRaw } from '@/features/show/types/similarShow';

export const mapSimilarShows = (
  similarShows: SimilarShowRaw[],
  genreDictionary: Map<number, string>,
): Omit<SimilarShow, 'isTracked'>[] =>
  similarShows.map((similarShow) => ({
    backdropPath: similarShow.backdrop_path,
    mediaType: 'tv',
    id: similarShow.id,
    name: similarShow.name,
    overview: similarShow.overview,
    releaseDate: similarShow.first_air_date,
    genres: similarShow.genre_ids
      .map((id) => {
        const name = genreDictionary.get(id);
        return name ? { id, name } : null;
      })
      .filter((genre): genre is { id: number; name: string } => genre !== null),
  }));
