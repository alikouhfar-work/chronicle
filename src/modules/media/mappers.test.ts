import { describe, expect, it } from 'vitest';
import { mapSimilar, mapTrending } from './mappers';
import type { TmdbListItemRaw } from './tmdb';

const dictionary = new Map([
  [18, 'Drama'],
  [10759, 'Action & Adventure'],
]);

const baseItem: TmdbListItemRaw = {
  id: 1,
  backdrop_path: '/backdrop.jpg',
  overview: 'Overview',
  genre_ids: [18, 999],
  vote_average: 8.1,
  vote_count: 100,
};

describe('mapTrending', () => {
  it('maps movie fields and filters unknown genres', () => {
    const [mapped] = mapTrending(
      [{ ...baseItem, title: 'Dune', release_date: '2021-01-01', media_type: 'movie' }],
      dictionary,
      'tv',
    );

    expect(mapped).toMatchObject({
      id: 1,
      name: 'Dune',
      releaseDate: '2021-01-01',
      mediaType: 'movie',
      rating: 8.1,
      voteCount: 100,
      genres: [{ id: 18, name: 'Drama' }],
    });
  });

  it('falls back to show title, air date and media type', () => {
    const [mapped] = mapTrending(
      [{ ...baseItem, name: 'Severance', first_air_date: '2022-01-01' }],
      dictionary,
      'tv',
    );

    expect(mapped).toMatchObject({
      name: 'Severance',
      releaseDate: '2022-01-01',
      mediaType: 'tv',
    });
  });

  it('labels untitled items', () => {
    const [mapped] = mapTrending([baseItem], dictionary, 'movie');
    expect(mapped?.name).toBe('Untitled');
    expect(mapped?.releaseDate).toBe('');
  });
});

describe('mapSimilar', () => {
  it('forces the requested media type', () => {
    const [mapped] = mapSimilar(
      [{ ...baseItem, title: 'Dune: Part Two', release_date: '2024-01-01' }],
      dictionary,
      'movie',
    );

    expect(mapped).toMatchObject({ name: 'Dune: Part Two', mediaType: 'movie' });
  });
});
