import { describe, expect, it } from 'vitest';
import { mapUpcomingMovies } from './mapUpcomingMovies';
import type { UpcomingMovie } from '@/modules/movie/types/upcomingMovie';

const movie = {
  id: 'm-1',
  name: 'Dune: Part Two',
  tmdbId: 21,
  overview: 'Desert power again.',
  releaseDate: new Date('2024-03-01T00:00:00Z'),
  posterPath: '/p.jpg',
} as unknown as UpcomingMovie;

describe('mapUpcomingMovies', () => {
  it('renames releaseDate to airDate', () => {
    expect(mapUpcomingMovies([movie])).toEqual([
      {
        id: 'm-1',
        name: 'Dune: Part Two',
        tmdbId: 21,
        overview: 'Desert power again.',
        airDate: new Date('2024-03-01T00:00:00Z'),
        posterPath: '/p.jpg',
      },
    ]);
  });
});
