import { tmdbFetch } from '@/utils/tmdbFetch';
import { GenreRaw } from '@/features/genre';

const getMovieGenreDictionary = async () => {
  const { genres } = await tmdbFetch<{ genres: GenreRaw[] }>('genre/movie/list', {
    next: {
      revalidate: 2592000,
    },
  });

  return new Map<number, string>(genres.map((genre) => [genre.id, genre.name]));
};

const getShowGenreDictionary = async () => {
  const { genres } = await tmdbFetch<{ genres: GenreRaw[] }>('genre/tv/list', {
    next: {
      revalidate: 2592000,
    },
  });

  return new Map<number, string>(genres.map((genre) => [genre.id, genre.name]));
};

export const getGenreDictionary = async () => {
  const [movieGenres, showGenres] = await Promise.all([
    getMovieGenreDictionary(),
    getShowGenreDictionary(),
  ]);

  return new Map([...movieGenres, ...showGenres]);
};
