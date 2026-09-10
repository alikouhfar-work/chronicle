import { tmdbFetch } from '@/utils/tmdbFetch';
import { Person, PersonRaw } from '@/features/person/types/person';
import { mapPerson } from '@/features/person/mappers/mapPerson';

export const getPerson = async (id: string): Promise<Person | null> => {
  try {
    const person = await tmdbFetch<PersonRaw>(`person/${id}`, {
      next: {
        revalidate: 86400,
      },
    });

    return mapPerson(person);
  } catch (error) {
    console.error('Failed to fetch person:', error);
    return null;
  }
};
