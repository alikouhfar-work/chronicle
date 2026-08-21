import { Credits, CreditsRaw } from '@/features/credit';
import { mapCast } from '@/features/credit/mappers/mapCast';
import { mapCrew } from '@/features/credit/mappers/mapCrew';

export const mapCredits = (credits: CreditsRaw): Credits => ({
  cast: mapCast(credits.cast),
  crew: mapCrew(credits.crew),
});
