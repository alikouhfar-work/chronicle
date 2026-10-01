import type { MediaType } from '@/shared/types/media';
import type { MediaGenre, SimilarMediaBase, TrendingMediaBase } from '@/modules/media/entities';
import type { TmdbListItemRaw } from '@/modules/media/tmdb';

const mapGenreRefs = (
  genreIds: number[],
  genreDictionary: Map<number, string>,
): MediaGenre[] =>
  genreIds
    .map((id) => {
      const name = genreDictionary.get(id);
      return name ? { id, name } : null;
    })
    .filter((genre): genre is MediaGenre => genre !== null);

const resolveTitle = (item: TmdbListItemRaw): string =>
  item.title ?? item.name ?? 'Untitled';

const resolveReleaseDate = (item: TmdbListItemRaw): string =>
  item.release_date ?? item.first_air_date ?? '';

export const mapTrending = (
  items: TmdbListItemRaw[],
  genreDictionary: Map<number, string>,
  fallbackMediaType: MediaType,
): Omit<TrendingMediaBase, 'isTracked'>[] =>
  items.map((item) => ({
    backdropPath: item.backdrop_path,
    id: item.id,
    name: resolveTitle(item),
    overview: item.overview,
    mediaType: item.media_type ?? fallbackMediaType,
    releaseDate: resolveReleaseDate(item),
    rating: item.vote_average,
    voteCount: item.vote_count,
    genres: mapGenreRefs(item.genre_ids ?? [], genreDictionary),
  }));

export const mapSimilar = (
  items: TmdbListItemRaw[],
  genreDictionary: Map<number, string>,
  mediaType: MediaType,
): Omit<SimilarMediaBase, 'isTracked'>[] =>
  items.map((item) => ({
    backdropPath: item.backdrop_path,
    mediaType,
    id: item.id,
    name: resolveTitle(item),
    overview: item.overview,
    releaseDate: resolveReleaseDate(item),
    genres: mapGenreRefs(item.genre_ids ?? [], genreDictionary),
  }));
