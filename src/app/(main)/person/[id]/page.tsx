import { getCombinedCredits, getPerson } from '@/features/person';
import { PersonDetails } from '@/features/person/components/PersonDetails';

type PersonDetailsParams = {
  id: string;
};

const PersonDetailsPage = async ({ params }: { params: Promise<PersonDetailsParams> }) => {
  const { id } = await params;
  const [person, combinedCredits] = await Promise.all([getPerson(id), getCombinedCredits(id)]);

  if (person) {
    return <PersonDetails person={person} combinedCredits={combinedCredits} />;
  }
};

export default PersonDetailsPage;
