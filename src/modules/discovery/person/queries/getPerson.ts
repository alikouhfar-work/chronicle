import { tmdbFetch } from '@/infra/tmdb/client';
import { Person, PersonRaw } from '@/modules/discovery/person/types/person';
import { mapPerson } from '@/modules/discovery/person/mappers/mapPerson';

export const getPerson = async (id: string): Promise<Person | null> => {
  try {
    const person = await tmdbFetch<PersonRaw>(`person/${id}`, {
      next: {
        revalidate: 604800,
      },
    });

    return mapPerson(person);
  } catch {{
    return null;
  }}
};