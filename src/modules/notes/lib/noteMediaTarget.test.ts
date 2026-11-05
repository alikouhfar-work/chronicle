import { describe, expect, it } from 'vitest';
import {
  episodeNoteTarget,
  movieNoteTarget,
  showNoteTarget,
  unavailableNoteTarget,
} from './noteMediaTarget';

describe('note media targets', () => {
  it('links a film to its library page', () => {
    expect(movieNoteTarget(550, 'Fight Club')).toEqual({
      mediaTitle: 'Fight Club',
      mediaSubtitle: 'Film',
      mediaHref: '/library/movie/550',
    });
  });

  it('links a series to its library page', () => {
    expect(showNoteTarget(1396, 'Breaking Bad')).toEqual({
      mediaTitle: 'Breaking Bad',
      mediaSubtitle: 'Series',
      mediaHref: '/library/tv/1396',
    });
  });

  it('links an episode through its show, and names the episode in the subtitle', () => {
    expect(
      episodeNoteTarget({
        showTmdbId: 1396,
        showName: 'Breaking Bad',
        episodeId: 'episode-1',
        seasonNumber: 1,
        episodeNumber: 2,
        name: 'Cat’s in the Bag…',
      }),
    ).toEqual({
      mediaTitle: 'Cat’s in the Bag…',
      mediaSubtitle: 'Breaking Bad · S1E2',
      mediaHref: '/library/tv/1396/episode/episode-1',
    });
  });

  it('keeps a note readable but unlinked when the title left the library', () => {
    expect(unavailableNoteTarget()).toEqual({
      mediaTitle: null,
      mediaSubtitle: 'No longer in your library',
      mediaHref: null,
    });
    expect(movieNoteTarget(550, null).mediaHref).toBeNull();
  });
});
