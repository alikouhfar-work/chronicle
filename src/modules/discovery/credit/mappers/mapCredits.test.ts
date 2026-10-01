import { describe, expect, it } from 'vitest';
import { mapCredits } from './mapCredits';
import type { CreditsRaw } from '@/modules/discovery/credit/types/credit';

const raw: CreditsRaw = {
  cast: [
    {
      adult: false,
      gender: 2,
      id: 1,
      known_for_department: 'Acting',
      name: 'Pedro Pascal',
      original_name: 'Pedro Pascal',
      popularity: 9,
      profile_path: '/p.jpg',
      character: 'Joel',
      credit_id: 'c1',
      order: 0,
    },
  ],
  crew: [
    {
      adult: false,
      gender: 2,
      id: 2,
      known_for_department: 'Directing',
      name: 'Some Director',
      original_name: 'Some Director',
      popularity: 7,
      profile_path: '/d.jpg',
      credit_id: 'c2',
      department: 'Directing',
      job: 'Director',
    },
  ],
};

describe('mapCredits', () => {
  it('maps cast and crew to camelCase models', () => {
    expect(mapCredits(raw)).toEqual({
      cast: [{ id: 1, name: 'Pedro Pascal', order: 0, character: 'Joel', profilePath: '/p.jpg' }],
      crew: [{ id: 2, job: 'Director', name: 'Some Director', profilePath: '/d.jpg' }],
    });
  });

  it('maps empty credit lists', () => {
    expect(mapCredits({ cast: [], crew: [] })).toEqual({ cast: [], crew: [] });
  });
});
