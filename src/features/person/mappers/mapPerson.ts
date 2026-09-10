import { Person, PersonRaw } from '@/features/person/types/person';

export const mapPerson = (person: PersonRaw): Person => ({
  alsoKnownAs: person.also_known_as,
  biography: person.biography,
  birthday: person.birthday,
  deathday: person.deathday,
  gender: person.gender,
  homepage: person.homepage,
  id: person.id,
  imdbId: person.imdb_id,
  knownForDepartment: person.known_for_department,
  name: person.name,
  placeOfBirth: person.place_of_birth,
  popularity: person.popularity,
  profilePath: person.profile_path,
});
