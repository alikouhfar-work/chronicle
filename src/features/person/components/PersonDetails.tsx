import { FC } from 'react';
import { PersonDetailsNavigation } from '@/features/person';
import { PersonDetailsProps } from '@/features/person/types/personDetails';
import { PersonDetailsFilmography } from '@/features/person/components/filmography/PersonDetailsFilmography';
import { PersonDetailsHero } from '@/features/person/components/PersonDetailsHero';

export const PersonDetails: FC<PersonDetailsProps> = ({ person, combinedCredits }) => {
  return (
    <article className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 pb-16 font-sans">
      <PersonDetailsNavigation person={person} />
      <PersonDetailsHero person={person} combinedCreditsCount={combinedCredits.length} />
      <PersonDetailsFilmography personName={person.name} combinedCredits={combinedCredits} />
    </article>
  );
};
