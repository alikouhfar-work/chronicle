import { Cast, CastRaw } from '@/features/credit/types/cast';

export const mapCast = (cast: CastRaw[]): Cast[] =>
  cast.map((person) => ({
    id: person.id,
    name: person.name,
    order: person.order,
    character: person.character,
    profilePath: person.profile_path,
  }));
