import { describe, expect, it } from 'vitest';
import { mapTrendingShows } from '@/modules/show/mappers/mapTrendingShows';
import { mapSimilarShows } from '@/modules/show/mappers/mapSimilarShows';
import { mapTrendingMovies } from '@/modules/movie/mappers/mapTrendingMovies';
import { mapSimilarMovies } from '@/modules/movie/mappers/mapSimilarMovies';
import type { TrendingShowRaw } from '@/modules/show/types/trendingShow';
import type { SimilarShowRaw } from '@/modules/show/types/similarShow';
import type { TrendingMovieRaw } from '@/modules/movie/types/trending';
import type { SimilarMovieRaw } from '@/modules/movie/types/similarMovie';

const dictionary = new Map([[18, 'Drama']]);

const showRaw: TrendingShowRaw = {
  adult: false,
  backdrop_path: '/b.jpg',
  id: 11,
  name: 'Severance',
  original_language: 'en',
  original_name: 'Severance',
  overview: 'Work-life balance.',
  poster_path: '/p.jpg',
  media_type: 'tv',
  genre_ids: [18],
  popularity: 9,
  first_air_date: '2022-01-01',
  vote_average: 8.5,
  vote_count: 50,
  origin_country: ['US'],
};

const similarShowRaw: SimilarShowRaw = {
  backdrop_path: '/b.jpg',
  genre_ids: [18],
  id: 12,
  origin_country: ['US'],
  original_language: 'en',
  original_name: 'Dark',
  overview: 'Time travel.',
  popularity: 8,
  poster_path: '/p.jpg',
  first_air_date: '2017-01-01',
  name: 'Dark',
  vote_average: 8.7,
  vote_count: 40,
};

const movieRaw: TrendingMovieRaw = {
  adult: false,
  backdrop_path: '/b.jpg',
  id: 21,
  title: 'Dune',
  original_title: 'Dune',
  overview: 'Desert power.',
  poster_path: '/p.jpg',
  media_type: 'movie',
  original_language: 'en',
  genre_ids: [18],
  popularity: 9,
  release_date: '2021-01-01',
  softcore: false,
  video: false,
  vote_average: 8.1,
  vote_count: 60,
};

const similarMovieRaw: SimilarMovieRaw = {
  backdrop_path: '/b.jpg',
  genre_ids: [18],
  id: 22,
  original_language: 'en',
  original_title: 'Dune: Part Two',
  overview: 'Desert power again.',
  popularity: 9,
  poster_path: '/p.jpg',
  release_date: '2024-01-01',
  title: 'Dune: Part Two',
  video: false,
  vote_average: 8.3,
  vote_count: 70,
};

describe('show/movie list mappers', () => {
  it('maps trending shows with the tv media type', () => {
    expect(mapTrendingShows([showRaw], dictionary)).toEqual([
      {
        backdropPath: '/b.jpg',
        id: 11,
        name: 'Severance',
        overview: 'Work-life balance.',
        mediaType: 'tv',
        releaseDate: '2022-01-01',
        rating: 8.5,
        voteCount: 50,
        genres: [{ id: 18, name: 'Drama' }],
      },
    ]);
  });

  it('maps similar shows with the tv media type', () => {
    const [mapped] = mapSimilarShows([similarShowRaw], dictionary);
    expect(mapped).toMatchObject({ id: 12, name: 'Dark', mediaType: 'tv' });
  });

  it('maps trending movies with the movie media type', () => {
    const [mapped] = mapTrendingMovies([movieRaw], dictionary);
    expect(mapped).toMatchObject({ id: 21, name: 'Dune', mediaType: 'movie' });
  });

  it('maps similar movies with the movie media type', () => {
    const [mapped] = mapSimilarMovies([similarMovieRaw], dictionary);
    expect(mapped).toMatchObject({ id: 22, name: 'Dune: Part Two', mediaType: 'movie' });
  });
});
