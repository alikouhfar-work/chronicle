import { Person } from '@/features/person/types/person';
import { CombinedCredit } from '@/features/person/types/combinedCredit';

export type PersonDetailsProps = {
  person: Person;
  combinedCredits: CombinedCredit[];
};
