import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { buildShareMessage } from './buildShareMessage';

const movie = {
  name: 'Dune: Part Two',
  tmdbId: 999,
  tagline: 'Long live the fighters.',
  overview: 'Paul unites with the Fremen.',
  genres: [
    { id: '1', name: 'Sci-Fi' },
    { id: '2', name: 'Adventure' },
  ],
  releaseDate: new Date('2024-03-01T00:00:00Z'),
  posterPath: '/poster.jpg',
  tracking: { rating: 5 },
} as never;

const show = {
  name: 'Severance',
  tmdbId: 123,
  tagline: null,
  overview: 'A workplace thriller.',
  genres: [{ id: '3', name: 'Drama' }],
  firstAirDate: new Date('2022-02-18T00:00:00Z'),
  lastAirDate: new Date('2025-01-17T00:00:00Z'),
  posterPath: null,
  seasons: [],
  tracking: null,
} as never;

const credits = {
  cast: [
    { id: 1, name: 'Zendaya', order: 1, character: 'Chani', profilePath: '/z.jpg' },
    { id: 2, name: 'Timothée Chalamet', order: 0, character: 'Paul', profilePath: '/t.jpg' },
    { id: 3, name: 'Extra One', order: 2, character: '', profilePath: '' },
    { id: 4, name: 'Extra Two', order: 3, character: '', profilePath: '' },
    { id: 5, name: 'Extra Three', order: 4, character: '', profilePath: '' },
    { id: 6, name: 'Extra Four', order: 5, character: '', profilePath: '' },
    { id: 7, name: 'Extra Five', order: 6, character: '', profilePath: '' },
  ],
  crew: [],
} as never;

describe('buildShareMessage', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds a full movie payload with top-5 billed cast', () => {
    const payload = buildShareMessage({
      media: movie,
      mediaType: 'movie',
      credits,
      origin: 'https://chronicle.example',
    });

    expect(payload.title).toBe('Dune: Part Two (2024)');
    expect(payload.url).toBe('https://chronicle.example/library/movie/999');
    expect(payload.posterUrl).toContain('/w500/poster.jpg');
    expect(payload.text).not.toContain('Long live the fighters.');
    // Headline leads the text itself; poster closes the message.
    expect(payload.text.startsWith('Dune: Part Two (2024)\nGenres: Sci-Fi, Adventure')).toBe(true);
    expect(payload.text).toContain('Genres: Sci-Fi, Adventure');
    expect(payload.text).toContain('My rating: 5/5');
    expect(payload.text).toContain(
      'Cast: Timothée Chalamet as Paul, Zendaya as Chani, Extra One, Extra Two, Extra Three',
    );
    expect(payload.text).not.toContain('Extra Four');
    expect(payload.text).toContain('Paul unites with the Fremen.');
    expect(payload.text).toContain('https://chronicle.example/library/movie/999');
    expect(payload.text.endsWith('https://image.tmdb.org/t/p/w500/poster.jpg')).toBe(true);
    expect(payload.text).not.toContain('Poster:');
    expect(payload.text).not.toContain('Details:');
  });

  it('builds a show payload with year range and no rating line', () => {
    const payload = buildShareMessage({
      media: show,
      mediaType: 'tv',
      credits: null,
      origin: 'https://chronicle.example',
    });

    expect(payload.title).toBe('Severance (2022-2025)');
    expect(payload.url).toBe('https://chronicle.example/library/tv/123');
    expect(payload.posterUrl).toBeNull();
    // No poster: the headline leads the text and the URL closes it.
    expect(payload.text.startsWith('Severance (2022-2025)')).toBe(true);
    expect(payload.text.endsWith('https://chronicle.example/library/tv/123')).toBe(true);
    expect(payload.text).toContain('Genres: Drama');
    expect(payload.text).not.toContain('My rating');
    expect(payload.text).not.toContain('Cast:');
  });

  it('handles RSC-serialized media where Dates arrive as ISO strings', () => {
    // Client components receive media across the RSC boundary, which turns
    // every Date into an ISO string. This is the shape the share button gets.
    const serializedShow = {
      name: 'Severance',
      tmdbId: 123,
      tagline: null,
      overview: 'A workplace thriller.',
      genres: [{ id: '3', name: 'Drama' }],
      firstAirDate: '2022-02-18T00:00:00.000Z',
      lastAirDate: '2025-01-17T00:00:00.000Z',
      posterPath: null,
      seasons: [],
      tracking: null,
    } as never;
    const serializedMovie = {
      name: 'Dune: Part Two',
      tmdbId: 999,
      tagline: 'Long live the fighters.',
      overview: 'Paul unites with the Fremen.',
      genres: [
        { id: '1', name: 'Sci-Fi' },
        { id: '2', name: 'Adventure' },
      ],
      releaseDate: '2024-03-01T00:00:00.000Z',
      posterPath: '/poster.jpg',
      tracking: { rating: 5 },
    } as never;

    const showPayload = buildShareMessage({
      media: serializedShow,
      mediaType: 'tv',
      credits: null,
      origin: 'https://chronicle.example',
    });
    expect(showPayload.title).toBe('Severance (2022-2025)');
    expect(showPayload.text.startsWith('Severance (2022-2025)')).toBe(true);

    const moviePayload = buildShareMessage({
      media: serializedMovie,
      mediaType: 'movie',
      credits,
      origin: 'https://chronicle.example',
    });
    expect(moviePayload.title).toBe('Dune: Part Two (2024)');
    expect(moviePayload.text.startsWith('Dune: Part Two (2024)')).toBe(true);
    expect(moviePayload.posterUrl).toContain('/w500/poster.jpg');
  });
});
