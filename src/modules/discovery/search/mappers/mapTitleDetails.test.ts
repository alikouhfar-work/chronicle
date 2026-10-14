import { describe, expect, it } from 'vitest';
import { mapTitleDetails } from './mapTitleDetails';

const movieRaw = {
  backdrop_path: '/backdrop.jpg',
  genres: [{ id: 878, name: 'Sci-Fi' }],
  id: 999,
  original_language: 'en',
  overview: 'Paul unites with the Fremen.',
  poster_path: '/poster.jpg',
  release_date: '2024-03-01',
  runtime: 166,
  status: 'Released',
  tagline: 'Long live the fighters.',
  title: 'Dune: Part Two',
  vote_average: 8.2,
};

const showRaw = {
  episode_run_time: [60],
  first_air_date: '2022-02-18',
  genres: [{ id: 18, name: 'Drama' }],
  id: 123,
  last_air_date: '2025-01-17',
  name: 'Severance',
  networks: [{ id: 1, logo_path: '', name: 'Apple TV+', origin_country: 'US' }],
  number_of_episodes: 28,
  number_of_seasons: 3,
  original_language: 'en',
  overview: 'A workplace thriller.',
  poster_path: '/severance.jpg',
  backdrop_path: '/severance-bg.jpg',
  status: 'Returning Series',
  tagline: '',
  vote_average: 8.4,
};

describe('mapTitleDetails', () => {
  it('normalizes movie details', () => {
    const details = mapTitleDetails('movie', movieRaw as never);

    expect(details.tmdbId).toBe(999);
    expect(details.mediaType).toBe('movie');
    expect(details.name).toBe('Dune: Part Two');
    expect(details.year).toBe('2024');
    expect(details.releaseLabel).toBe('March 1, 2024');
    expect(details.runtimeLabel).toBe('166 min');
    expect(details.seasonsLabel).toBeNull();
    expect(details.networkLabel).toBeNull();
    expect(details.languageLabel).toBe('EN');
    expect(details.rating).toBe(8.2);
    expect(details.tagline).toBe('Long live the fighters.');
  });

  it('normalizes show details with a year range', () => {
    const details = mapTitleDetails('tv', showRaw as never);

    expect(details.name).toBe('Severance');
    expect(details.year).toBe('2022-2025');
    expect(details.releaseLabel).toBe('February 18, 2022');
    expect(details.runtimeLabel).toBe('60 min / ep');
    expect(details.seasonsLabel).toBe('3 Seasons · 28 Episodes');
    expect(details.networkLabel).toBe('Apple TV+');
    expect(details.status).toBe('Returning Series');
  });

  it('falls back to N/A labels when dates are missing', () => {
    const details = mapTitleDetails('tv', {
      ...showRaw,
      first_air_date: '',
      last_air_date: '',
    } as never);

    expect(details.year).toBe('N/A');
    expect(details.releaseLabel).toBeNull();
  });
});
