import type { Cast, CastRaw } from '@/modules/discovery/credit/types/cast';
import type { Crew, CrewRaw } from '@/modules/discovery/credit/types/crew';

export type Credits = {
  cast: Cast[];
  crew: Crew[];
};

export type CreditsRaw = {
  cast: CastRaw[];
  crew: CrewRaw[];
};
