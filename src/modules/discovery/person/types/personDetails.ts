import type { Person } from '@/modules/discovery/person/types/person';
import type { CombinedCredit } from '@/modules/discovery/person/types/combinedCredit';

export type PersonDetailsProps = {
  person: Person;
  combinedCredits: CombinedCredit[];
};
