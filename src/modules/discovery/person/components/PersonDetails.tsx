import { PersonDetailsNavigation } from '@/modules/discovery/person';
import { PersonDetailsProps } from '@/modules/discovery/person/types/personDetails';
import { PersonDetailsFilmography } from '@/modules/discovery/person/components/filmography/PersonDetailsFilmography';
import { PersonDetailsHero } from '@/modules/discovery/person/components/PersonDetailsHero';

export const PersonDetails = ({ person, combinedCredits }: PersonDetailsProps) => {
  return (
    <article className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 pb-16 font-sans">
      <PersonDetailsNavigation person={person} />
      <PersonDetailsHero person={person} combinedCreditsCount={combinedCredits.length} />
      <PersonDetailsFilmography personName={person.name} combinedCredits={combinedCredits} />
    </article>
  );
};
