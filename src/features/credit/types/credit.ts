import { Cast, CastRaw } from '@/features/credit/types/cast';
import { Crew, CrewRaw } from '@/features/credit/types/crew';

export type Credits = {
  cast: Cast[];
  crew: Crew[];
};

export type CreditsRaw = {
  cast: CastRaw[];
  crew: CrewRaw[];
};
