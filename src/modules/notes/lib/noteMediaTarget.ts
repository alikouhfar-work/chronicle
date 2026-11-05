import type { UserNoteEntry } from '@/modules/notes/types';

type Target = Pick<UserNoteEntry, 'mediaTitle' | 'mediaSubtitle' | 'mediaHref'>;

/**
 * Link and labels for a note's media. The targets are resolved against the
 * viewer's own library — every URL is a `/library` route, never a TMDB id the
 * user does not track — so a note whose title has been removed from the library
 * keeps its text but loses its link.
 */
export const movieNoteTarget = (tmdbId: number, name: string | null): Target => ({
  mediaTitle: name,
  mediaSubtitle: name ? 'Film' : null,
  mediaHref: name ? `/library/movie/${tmdbId}` : null,
});

export const showNoteTarget = (tmdbId: number, name: string | null): Target => ({
  mediaTitle: name,
  mediaSubtitle: name ? 'Series' : null,
  mediaHref: name ? `/library/tv/${tmdbId}` : null,
});

export const episodeNoteTarget = (input: {
  showTmdbId: number;
  showName: string;
  episodeId: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string | null;
}): Target => ({
  mediaTitle: input.name,
  mediaSubtitle: `${input.showName} · S${input.seasonNumber}E${input.episodeNumber}`,
  mediaHref: `/library/tv/${input.showTmdbId}/episode/${input.episodeId}`,
});

/** The title left the library: keep the note, drop the link. */
export const unavailableNoteTarget = (): Target => ({
  mediaTitle: null,
  mediaSubtitle: 'No longer in your library',
  mediaHref: null,
});
