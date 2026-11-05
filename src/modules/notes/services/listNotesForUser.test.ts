import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findNotes: vi.fn(),
  findMovies: vi.fn(),
  findShows: vi.fn(),
  findEpisodes: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: {
    mediaNote: { findMany: mocks.findNotes },
    movie: { findMany: mocks.findMovies },
    show: { findMany: mocks.findShows },
    episode: { findMany: mocks.findEpisodes },
  },
}));

import { listNotesForUser } from './listNotesForUser';

const noteRow = (overrides: Record<string, unknown>) => ({
  id: 'note-1',
  content: 'Watched it twice.',
  createdAt: new Date('2026-11-01T10:00:00.000Z'),
  updatedAt: new Date('2026-11-01T10:00:00.000Z'),
  mediaType: 'MOVIE',
  tmdbId: 550,
  ...overrides,
});

describe('listNotesForUser', () => {
  beforeEach(() => {
    mocks.findNotes.mockReset();
    mocks.findMovies.mockReset();
    mocks.findShows.mockReset();
    mocks.findEpisodes.mockReset();
    mocks.findMovies.mockResolvedValue([]);
    mocks.findShows.mockResolvedValue([]);
    mocks.findEpisodes.mockResolvedValue([]);
  });

  it('resolves a film from the owner’s library', async () => {
    mocks.findNotes.mockResolvedValue([noteRow({})]);
    mocks.findMovies.mockResolvedValue([{ tmdbId: 550, name: 'Fight Club' }]);

    const [entry] = await listNotesForUser({ userId: 'user-1' });

    expect(entry).toMatchObject({
      content: 'Watched it twice.',
      mediaType: 'movie',
      tmdbId: 550,
      mediaTitle: 'Fight Club',
      mediaHref: '/library/movie/550',
    });
    expect(mocks.findMovies).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', tmdbId: { in: [550] } } }),
    );
  });

  it('resolves series and episodes in one pass', async () => {
    mocks.findNotes.mockResolvedValue([
      noteRow({ id: 'show-note', mediaType: 'SHOW', tmdbId: 1396 }),
      noteRow({ id: 'episode-note', mediaType: 'EPISODE', tmdbId: 62085 }),
    ]);
    mocks.findShows.mockResolvedValue([{ tmdbId: 1396, name: 'Breaking Bad' }]);
    mocks.findEpisodes.mockResolvedValue([
      {
        id: 'episode-1',
        tmdbId: 62085,
        name: 'Pilot',
        episodeNumber: 1,
        season: { seasonNumber: 1, show: { tmdbId: 1396, name: 'Breaking Bad' } },
      },
    ]);

    const entries = await listNotesForUser({ userId: 'user-1' });

    expect(entries.map((entry) => entry.mediaHref)).toEqual([
      '/library/tv/1396',
      '/library/tv/1396/episode/episode-1',
    ]);
    expect(entries[1].mediaSubtitle).toBe('Breaking Bad · S1E1');
  });

  it('keeps a note whose title left the library, without a link', async () => {
    mocks.findNotes.mockResolvedValue([noteRow({})]);

    const [entry] = await listNotesForUser({ userId: 'user-1' });

    expect(entry).toMatchObject({
      content: 'Watched it twice.',
      mediaTitle: null,
      mediaSubtitle: 'No longer in your library',
      mediaHref: null,
    });
  });

  it('filters by content when a search is given', async () => {
    mocks.findNotes.mockResolvedValue([]);

    await listNotesForUser({ userId: 'user-1', search: '  rewatch  ' });

    expect(mocks.findNotes).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          deletedAt: null,
          content: { contains: 'rewatch', mode: 'insensitive' },
        },
      }),
    );
  });

  it('skips the media queries when there are no notes', async () => {
    mocks.findNotes.mockResolvedValue([]);

    expect(await listNotesForUser({ userId: 'user-1' })).toEqual([]);
    expect(mocks.findMovies).not.toHaveBeenCalled();
    expect(mocks.findShows).not.toHaveBeenCalled();
    expect(mocks.findEpisodes).not.toHaveBeenCalled();
  });
});
