import { describe, expect, it } from 'vitest';
import { mapUpNextEpisodes } from './mapUpNextEpisodes';
import { mapUpcomingEpisodes } from './mapUpcomingEpisodes';
import type { UpNextEpisode } from '@/modules/episode-season/types/upNextEpisode';
import type { UpcomingEpisode } from '@/modules/episode-season/types/upcomingEpisode';

const airDate = new Date('2024-05-01T20:00:00Z');

const episode = {
  id: 'ep-1',
  episodeNumber: 3,
  name: 'The Turning Point',
  overview: 'Things change.',
  airDate,
  season: {
    showId: 'show-1',
    seasonNumber: 2,
    show: { name: 'Severance', tmdbId: 11, posterPath: '/p.jpg' },
  },
} as unknown as UpNextEpisode;

const upcoming = {
  ...episode,
  id: 'ep-2',
  season: {
    showId: 'show-1',
    seasonNumber: 2,
    show: { name: 'Severance', tmdbId: 11, posterPath: '/p.jpg' },
  },
} as unknown as UpcomingEpisode;

describe('mapUpNextEpisodes', () => {
  it('flattens season and show fields onto the episode', () => {
    expect(mapUpNextEpisodes([episode])).toEqual([
      {
        id: 'ep-1',
        name: 'The Turning Point',
        airDate,
        overview: 'Things change.',
        showId: 'show-1',
        showName: 'Severance',
        episodeNumber: 3,
        showTmdbId: 11,
        seasonNumber: 2,
        posterPath: '/p.jpg',
      },
    ]);
  });
});

describe('mapUpcomingEpisodes', () => {
  it('groups episodes by show and air date', () => {
    const [group] = mapUpcomingEpisodes([upcoming, { ...upcoming, id: 'ep-3' }]);

    expect(group).toMatchObject({
      id: 'show-1:2024-05-01',
      showId: 'show-1',
      showName: 'Severance',
      showTmdbId: 11,
      airDate,
    });
    expect(group?.episodes).toHaveLength(2);
    expect(group?.episodes[0]).toMatchObject({ id: 'ep-2', seasonNumber: 2, episodeNumber: 3 });
  });

  it('keeps different dates in separate groups', () => {
    const otherDay = {
      ...upcoming,
      id: 'ep-4',
      airDate: new Date('2024-05-08T20:00:00Z'),
    } as unknown as UpcomingEpisode;

    expect(mapUpcomingEpisodes([upcoming, otherDay])).toHaveLength(2);
  });
});
