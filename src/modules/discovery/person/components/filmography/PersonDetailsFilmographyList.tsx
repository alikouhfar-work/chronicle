import { PersonDetailsFilmographyListProps } from '@/modules/discovery/person/types/personDetailsFilmographyList';
import { PersonDetailsFilmographyCard } from '@/modules/discovery/person/components/filmography/PersonDetailsFilmographyCard';

export const PersonDetailsFilmographyList = ({
  combinedCredits,
}: PersonDetailsFilmographyListProps) => {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {combinedCredits.map((combinedCredit) => (
        <PersonDetailsFilmographyCard
          combinedCredit={combinedCredit}
          key={`${combinedCredit.mediaType}_${combinedCredit.id}_${combinedCredit.creditId || combinedCredit.character}`}
        />
      ))}
    </ul>
  );
};
