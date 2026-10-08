import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { GenreRaw } from '@/modules/discovery/genre';

const getMovieGenreDictionary = async (): Promise<Map<number, string>> => {
  try {
    const { genres } = await tmdbFetch<{ genres: GenreRaw[] }>('genre/movie/list', {
      next: { revalidate: 604800 },
    });
    return new Map<number, string>(genres.map((genre) => [genre.id, genre.name]));
  } catch {{
    return new Map<number, string>();
  }}
};

const getShowGenreDictionary = async (): Promise<Map<number, string>> => {
  try {
    const { genres } = await tmdbFetch<{ genres: GenreRaw[] }>('genre/tv/list', {
      next: { revalidate: 604800 },
    });
    return new Map<number, string>(genres.map((genre) => [genre.id, genre.name]));
  } catch {{
    return new Map<number, string>();
  }}
};

export const getGenreDictionary = async (): Promise<Map<number, string>> => {
  const [movieGenres, showGenres] = await Promise.all([
    getMovieGenreDictionary(),
    getShowGenreDictionary(),
  ]);

  return new Map([...movieGenres, ...showGenres]);
};
