import type { PersonDetailsFilmographyProps } from '@/modules/discovery/person/types/personDetailsFilmography';
import { PersonDetailsFilmographyList } from '@/modules/discovery/person/components/filmography/PersonDetailsFilmographyList';
import { PersonDetailsFilmographyEmpty } from '@/modules/discovery/person/components/filmography/PersonDetailsFilmographyEmpty';

export const PersonDetailsFilmography = ({
  personName,
  combinedCredits,
}: PersonDetailsFilmographyProps) => {
  return (
    <div className="space-y-5 border-t border-line pt-4">
      {/* Section Header with Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
            <span className="h-2 w-2 rounded-pill bg-accent-strong" />
            <span>Filmography & Series</span>
          </h3>
          <p className="text-xs text-ink-muted">
            Combined titles starring {personName} ({combinedCredits.length} works total)
          </p>
        </div>
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
