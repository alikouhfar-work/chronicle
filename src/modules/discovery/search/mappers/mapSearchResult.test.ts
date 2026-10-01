import { describe, expect, it } from 'vitest';
import { mapSearchResult } from './mapSearchResult';
import type { SearchResultRaw } from '@/modules/discovery/search/types/searchResult';

const dictionary = new Map([[18, 'Drama']]);

const tvRaw = {
  backdrop_path: '/b.jpg',
  id: 1,
  name: 'Severance',
  overview: 'Work-life balance.',
  poster_path: '/p.jpg',
  media_type: 'tv',
  first_air_date: '2022-01-01',
  vote_average: 8.5,
  origin_country: ['US'],
  original_language: 'en',
  genre_ids: [18],
} as unknown as SearchResultRaw;

const movieRaw = {
  backdrop_path: '/b.jpg',
  id: 2,
  title: 'Dune',
  overview: 'Desert power.',
  poster_path: '/p.jpg',
  media_type: 'movie',
  release_date: '2021-01-01',
  vote_average: 8.1,
  original_language: 'en',
  genre_ids: [18],
} as unknown as SearchResultRaw;

const personRaw = {
  id: 3,
  name: 'Some Actor',
  media_type: 'person',
} as unknown as SearchResultRaw;

describe('mapSearchResult', () => {
  it('routes tv and movie results to their mappers', () => {
    const [show, movie] = mapSearchResult([tvRaw, movieRaw], dictionary);

    expect(show).toMatchObject({ id: 1, name: 'Severance', mediaType: 'tv' });
    expect(movie).toMatchObject({ id: 2, name: 'Dune', mediaType: 'movie' });
  });

  it('drops non-media results', () => {
    expect(mapSearchResult([personRaw], dictionary)).toEqual([]);
  });

  it('resolves genre names and drops unknown ids', () => {
    const [show] = mapSearchResult(
      [{ ...tvRaw, genre_ids: [18, 404] } as unknown as SearchResultRaw],
      dictionary,
    );
    expect(show?.genres).toEqual([{ id: 18, name: 'Drama' }]);
  });
});
