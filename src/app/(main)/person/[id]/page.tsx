import { getCombinedCredits, getPerson } from '@/modules/discovery/person';
import { PersonDetails } from '@/modules/discovery/person/components/PersonDetails';
import { notFound } from 'next/navigation';
import type { PersonDetailsPageProps } from '@/modules/discovery/person/types/personDetailsPage';

const PersonDetailsPage = async ({ params }: PersonDetailsPageProps) => {
  const { id } = await params;
  const [person, combinedCredits] = await Promise.all([getPerson(id), getCombinedCredits(id)]);

  if (!person) {
    notFound();
  }

  return <PersonDetails person={person} combinedCredits={combinedCredits} />;
};

export default PersonDetailsPage;
