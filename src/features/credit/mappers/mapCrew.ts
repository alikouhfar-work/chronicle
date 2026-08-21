import { Crew, CrewRaw } from '@/features/credit/types/crew';

export const mapCrew = (crew: CrewRaw[]): Crew[] =>
  crew.map((person) => ({
    id: person.id,
    job: person.job,
    name: person.name,
    profilePath: person.profile_path,
  }));
