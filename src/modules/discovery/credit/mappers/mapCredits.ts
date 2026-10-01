import { Credits, CreditsRaw } from '@/modules/discovery/credit';
import { mapCast } from '@/modules/discovery/credit/mappers/mapCast';
import { mapCrew } from '@/modules/discovery/credit/mappers/mapCrew';

export const mapCredits = (credits: CreditsRaw): Credits => ({
  cast: mapCast(credits.cast),
  crew: mapCrew(credits.crew),
});
