import 'server-only';

import { prisma } from '@/infra/db/prisma';
import { APP_MEDIA_TYPE } from '@/modules/comments/lib/validation';
import { NOTE_PAGE_SIZE } from '@/modules/notes/constants';
import {
  episodeNoteTarget,
  movieNoteTarget,
  showNoteTarget,
  unavailableNoteTarget,
} from '@/modules/notes/lib/noteMediaTarget';
import { toNoteView } from '@/modules/notes/lib/toNoteView';
import type { NoteMediaType, UserNoteEntry } from '@/modules/notes/types';

/** Notes by scope, so one media type never costs more queries than another. */
const tmdbIdsByScope = (
  notes: Array<{ mediaType: keyof typeof APP_MEDIA_TYPE; tmdbId: number }>,
  scope: NoteMediaType,
): number[] =>
  notes
    .filter((note) => APP_MEDIA_TYPE[note.mediaType] === scope)
    .map((note) => note.tmdbId);

/**
 * Every private note the viewer wrote, newest first, with the title each one
 * belongs to resolved from their own library. Scoped by `userId` with no
 * alternative read path — a note is never visible to another account.
 *
 * A note survives its title leaving the library (the rows are not related by
 * key), so the media target can be missing: the note is still returned, with a
 * null title and no link, instead of quietly disappearing.
 */
export const listNotesForUser = async (input: {
  userId: string;
  search?: string;
}): Promise<UserNoteEntry[]> => {
  const search = input.search?.trim() ?? '';

  const notes = await prisma.mediaNote.findMany({
    where: {
      userId: input.userId,
      deletedAt: null,
      ...(search ? { content: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: NOTE_PAGE_SIZE,
  });

  if (notes.length === 0) return [];

  const movieIds = tmdbIdsByScope(notes, 'movie');
  const showIds = tmdbIdsByScope(notes, 'show');
  const episodeIds = tmdbIdsByScope(notes, 'episode');

  const [movies, shows, episodes] = await Promise.all([
    movieIds.length
      ? prisma.movie.findMany({
          where: { userId: input.userId, tmdbId: { in: movieIds } },
          select: { tmdbId: true, name: true },
        })
      : [],
    showIds.length
      ? prisma.show.findMany({
          where: { userId: input.userId, tmdbId: { in: showIds } },
          select: { tmdbId: true, name: true },
        })
      : [],
    episodeIds.length
      ? prisma.episode.findMany({
          where: { tmdbId: { in: episodeIds }, season: { show: { userId: input.userId } } },
          select: {
            id: true,
            tmdbId: true,
            name: true,
            episodeNumber: true,
            season: {
              select: {
                seasonNumber: true,
                show: { select: { tmdbId: true, name: true } },
              },
            },
          },
        })
      : [],
  ]);

  const movieByTmdb = new Map(movies.map((movie) => [movie.tmdbId, movie]));
  const showByTmdb = new Map(shows.map((show) => [show.tmdbId, show]));
  const episodeByTmdb = new Map(episodes.map((episode) => [episode.tmdbId, episode]));

  return notes.map((note) => {
    const mediaType = APP_MEDIA_TYPE[note.mediaType];

    const movie = mediaType === 'movie' ? movieByTmdb.get(note.tmdbId) : undefined;
    const show = mediaType === 'show' ? showByTmdb.get(note.tmdbId) : undefined;
    const episode = mediaType === 'episode' ? episodeByTmdb.get(note.tmdbId) : undefined;

    const target = movie
      ? movieNoteTarget(movie.tmdbId, movie.name)
      : show
        ? showNoteTarget(show.tmdbId, show.name)
        : episode
          ? episodeNoteTarget({
              showTmdbId: episode.season.show.tmdbId,
              showName: episode.season.show.name,
              episodeId: episode.id,
              seasonNumber: episode.season.seasonNumber,
              episodeNumber: episode.episodeNumber,
              name: episode.name,
            })
          : unavailableNoteTarget();

    return {
      ...toNoteView(note),
      mediaType,
      tmdbId: note.tmdbId,
      ...target,
    };
  });
};
