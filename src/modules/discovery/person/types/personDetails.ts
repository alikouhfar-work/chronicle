import { Person } from '@/modules/discovery/person/types/person';
import { CombinedCredit } from '@/modules/discovery/person/types/combinedCredit';

export type PersonDetailsProps = {
  person: Person;
  combinedCredits: CombinedCredit[];
};
