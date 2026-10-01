import { describe, expect, it } from 'vitest';
import { mapPerson } from './mapPerson';
import { mapCombinedCredits } from './mapCombinedCredits';
import type { PersonRaw } from '@/modules/discovery/person/types/person';
import type { CombinedCreditRaw } from '@/modules/discovery/person/types/combinedCredit';

const dictionary = new Map([[18, 'Drama']]);

const personRaw: PersonRaw = {
  also_known_as: ['PP'],
  biography: 'Actor.',
  birthday: '1975-04-02',
  deathday: '',
  gender: 2,
  homepage: '',
  id: 1,
  imdb_id: 'nm123',
  known_for_department: 'Acting',
  name: 'Pedro Pascal',
  place_of_birth: 'Santiago, Chile',
  popularity: 9,
  profile_path: '/p.jpg',
};

const showCredit = {
  backdrop_path: '/b.jpg',
  genre_ids: [18],
  id: 11,
  origin_country: ['US'],
  original_language: 'en',
  original_name: 'Show',
  overview: 'A show.',
  popularity: 8,
  poster_path: '/p.jpg',
  first_air_date: '2020-01-01',
  softcore: false,
  name: 'Show',
  vote_average: 8,
  vote_count: 10,
  character: 'Lead',
  credit_id: 'c1',
  episode_count: 8,
  first_credit_air_date: '2020-01-01',
  media_type: 'tv',
} as const;

const movieCredit = {
  backdrop_path: '/b.jpg',
  genre_ids: [18],
  id: 21,
  original_language: 'en',
  original_title: 'Film',
  overview: 'A film.',
  popularity: 9,
  poster_path: '/p.jpg',
  release_date: '2021-01-01',
  title: 'Film',
  video: false,
  vote_average: 8.2,
  vote_count: 20,
  character: 'Lead',
  credit_id: 'c2',
  order: 0,
  media_type: 'movie',
} as const;

describe('mapPerson', () => {
  it('maps snake_case fields to camelCase', () => {
    expect(mapPerson(personRaw)).toMatchObject({
      id: 1,
      name: 'Pedro Pascal',
      imdbId: 'nm123',
      knownForDepartment: 'Acting',
      profilePath: '/p.jpg',
    });
  });
});

describe('mapCombinedCredits', () => {
  it('routes tv and movie credits to their mappers', () => {
    const [show, movie] = mapCombinedCredits(
      [showCredit, movieCredit] as unknown as CombinedCreditRaw[],
      dictionary,
    );

    expect(show).toMatchObject({ id: 11, name: 'Show', mediaType: 'tv' });
    expect(movie).toMatchObject({ id: 21, name: 'Film', mediaType: 'movie' });
  });

  it('drops unknown media types', () => {
    const unknown = { ...movieCredit, media_type: 'person' };
    expect(
      mapCombinedCredits([unknown] as unknown as CombinedCreditRaw[], dictionary),
    ).toEqual([]);
  });
});
