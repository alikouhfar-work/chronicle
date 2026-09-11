import { FC } from 'react';
import { PersonDetailsFilmographyProps } from '@/features/person/types/personDetailsFilmography';
import { PersonDetailsFilmographyList } from '@/features/person/components/filmography/PersonDetailsFilmographyList';
import { PersonDetailsFilmographyEmpty } from '@/features/person/components/filmography/PersonDetailsFilmographyEmpty';

export const PersonDetailsFilmography: FC<PersonDetailsFilmographyProps> = ({
  personName,
  combinedCredits,
}) => {
  return (
    <div className="space-y-5 border-t border-white/8 pt-4">
      {/* Section Header with Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span>Filmography & Series</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Combined titles starring {personName} ({combinedCredits.length} works total)
          </p>
        </div>

        {/* Filter and Search controls */}
        {/*<PersonDetailsFilmographyFilter combinedCredits={combinedCredits} />*/}
      </div>

      {/* Filmography Cards Grid */}
      {combinedCredits.length === 0 ? (
        <PersonDetailsFilmographyEmpty />
      ) : (
        <PersonDetailsFilmographyList combinedCredits={combinedCredits} />
      )}
    </div>
  );
};
