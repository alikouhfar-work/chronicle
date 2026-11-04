import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
  findMovie: vi.fn(),
  findShow: vi.fn(),
  findEpisode: vi.fn(),
  requireUserId: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: {
    mediaNote: {
      findMany: mocks.findMany,
      create: mocks.create,
      update: mocks.update,
      findUnique: mocks.findUnique,
    },
    movie: { findFirst: mocks.findMovie },
    show: { findFirst: mocks.findShow },
    episode: { findFirst: mocks.findEpisode },
  },
}));

vi.mock('@/infra/tmdb/forUser', () => ({
  requireUserId: mocks.requireUserId,
}));

import { createNote } from '@/modules/notes/actions/createNote';
import { deleteNote } from '@/modules/notes/actions/deleteNote';
import { updateNote } from '@/modules/notes/actions/updateNote';
import { listNotes } from '@/modules/notes/services/listNotes';
import { NOTE_MAX_LENGTH } from '@/modules/notes/constants';

const noteRow = {
  id: 'note-1',
  userId: 'user-1',
  mediaType: 'MOVIE',
  tmdbId: 550,
  content: 'Still lands',
  createdAt: new Date('2026-11-01T10:00:00Z'),
  updatedAt: new Date('2026-11-01T10:00:00Z'),
  deletedAt: null,
};

describe('private notes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue('user-1');
    mocks.findMany.mockResolvedValue([]);
    mocks.findMovie.mockResolvedValue({ id: 'movie-row-1' });
    mocks.findShow.mockResolvedValue({ id: 'show-row-1' });
    mocks.findEpisode.mockResolvedValue({ id: 'episode-row-1' });
  });

  it('lists only the viewer notes for one media item, newest first', async () => {
    const result = await listNotes('movie', 550);

    expect(result.success).toBe(true);
    expect(mocks.findMany.mock.calls[0][0]).toMatchObject({
      where: { userId: 'user-1', mediaType: 'MOVIE', tmdbId: 550, deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  });

  it('rejects unknown media references without querying', async () => {
    await listNotes('movie', 0);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it('returns an empty list for signed-out readers instead of leaking an error', async () => {
    mocks.requireUserId.mockRejectedValue(new Error('unauthenticated'));

    const result = await listNotes('movie', 550);

    expect(result).toEqual({ success: true, notes: [] });
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it('creates a note against the media TMDB id with the Prisma media enum', async () => {
    mocks.create.mockResolvedValue(noteRow);

    const result = await createNote({ mediaType: 'movie', tmdbId: 550, content: '  Still lands  ' });

    expect(result.success).toBe(true);
    expect(mocks.create.mock.calls[0][0].data).toMatchObject({
      userId: 'user-1',
      mediaType: 'MOVIE',
      tmdbId: 550,
      content: 'Still lands',
    });
    expect(result.note?.id).toBe('note-1');
  });

  it('refuses to note media that left the viewer library', async () => {
    mocks.findMovie.mockResolvedValue(null);

    const result = await createNote({ mediaType: 'movie', tmdbId: 550, content: 'Nope' });

    expect(result.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rejects an empty or oversized note before touching the database', async () => {
    const empty = await createNote({ mediaType: 'movie', tmdbId: 550, content: '   ' });
    const tooLong = await createNote({
      mediaType: 'movie',
      tmdbId: 550,
      content: 'x'.repeat(NOTE_MAX_LENGTH + 1),
    });

    expect(empty.success).toBe(false);
    expect(tooLong.success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('lets the owner edit a note and blocks everyone else', async () => {
    mocks.findUnique.mockResolvedValue({ userId: 'user-1', deletedAt: null });
    mocks.update.mockResolvedValue({ ...noteRow, content: 'Edited' });

    const owned = await updateNote('note-1', { content: 'Edited' });
    expect(owned.success).toBe(true);
    expect(mocks.update.mock.calls[0][0].data).toEqual({ content: 'Edited' });

    mocks.findUnique.mockResolvedValue({ userId: 'user-2', deletedAt: null });
    const foreign = await updateNote('note-1', { content: 'Hijacked' });
    expect(foreign.success).toBe(false);
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  it('soft-deletes only the viewer own note', async () => {
    mocks.findUnique.mockResolvedValue({ userId: 'user-1', deletedAt: null });

    const result = await deleteNote('note-1');

    expect(result.success).toBe(true);
    expect(mocks.update.mock.calls[0][0].data.deletedAt).toBeInstanceOf(Date);

    mocks.findUnique.mockResolvedValue({ userId: 'user-2', deletedAt: null });
    expect((await deleteNote('note-1')).success).toBe(false);
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  it('treats an already deleted note as missing', async () => {
    mocks.findUnique.mockResolvedValue({ userId: 'user-1', deletedAt: new Date() });

    expect((await deleteNote('note-1')).success).toBe(false);
    expect((await updateNote('note-1', { content: 'x' })).success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
