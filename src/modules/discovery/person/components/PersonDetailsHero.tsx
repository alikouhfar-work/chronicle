import {
  IconCalendar,
  IconExternalLink,
  IconGlobe,
  IconMapPin,
  IconSparkles,
} from '@tabler/icons-react';
import { PersonDetailsBiography } from '@/modules/discovery/person/components/PersonDetailsBiography';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { formatBirthInfo } from '@/modules/discovery/person/utils/formatBirthInfo';
import { getGenderLabel } from '@/modules/discovery/person/utils/getGenderLabel';
import type { PersonDetailsHeroProps } from '@/modules/discovery/person/types/personDetailsHero';

export const PersonDetailsHero = ({ person, combinedCreditsCount }: PersonDetailsHeroProps) => {
  const formattedBirthInfo = formatBirthInfo(person.birthday, person.deathday);
  const genderLabel = getGenderLabel(person.gender);

  return (
    <div className="glass-panel relative flex flex-col gap-8 overflow-hidden rounded-card border border-line p-6 shadow-2xl sm:p-8 md:flex-row">
      {/* Ambient Radial Lights */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-pill bg-accent-bright/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-pill bg-info-soft blur-3xl" />

      {/* Profile Image */}
      <div className="group relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-card border border-line bg-surface-sunken shadow-2xl select-none md:w-60">
        {person.profilePath ? (
          <Image
            fill
            alt={person.name}
            sizes="(max-width: 768px) 100vw, 240px"
            src={getTmdbImageUrl(person.profilePath, 'backdrop', 'w500')!}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-surface-strong via-surface-raised to-accent/30 p-6 text-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-pill border border-accent-line bg-accent-bright/20 text-2xl font-bold text-accent-ink shadow-lg">
              {person.name
                .split(' ')
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')}
            </div>
            <p className="line-clamp-2 text-sm font-bold text-ink">{person.name}</p>
          </div>
        )}

        <div className="from-canvas/90 pointer-events-none absolute inset-0 bg-linear-to-t via-transparent to-transparent" />

        {/* Quick overlay pill */}
        <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-center justify-between rounded-pill border border-line bg-black/60 px-3 py-1.5 text-micro font-medium text-ink-secondary backdrop-blur-md">
          <span>{genderLabel}</span>
          {combinedCreditsCount > 0 && (
            <span className="font-semibold text-accent-ink">{combinedCreditsCount} Credits</span>
          )}
        </div>
      </div>

      {/* Personal Details Information */}
      <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5">
        <div className="space-y-4">
          {/* Name and Department Tag */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {person.name}
              </h2>
              <span className="apple-badge border border-accent-line bg-accent-bright/20 text-xs font-semibold text-accent-ink">
                {person.knownForDepartment}
              </span>
            </div>
          </div>

          {/* Quick Meta Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {formattedBirthInfo && (
              <div className="flex items-center gap-1.5 rounded-pill border border-line bg-surface-soft px-3 py-1.5 text-ink-secondary">
                <IconCalendar size={13} className="shrink-0 text-accent-ink" />
                <span>{formattedBirthInfo}</span>
              </div>
            )}

            {person.placeOfBirth && (
              <div className="flex items-center gap-1.5 rounded-pill border border-line bg-surface-soft px-3 py-1.5 text-ink-secondary">
                <IconMapPin size={13} className="shrink-0 text-accent-ink" />
                <span className="max-w-50 truncate">{person.placeOfBirth}</span>
              </div>
            )}

            {person.imdbId && (
              <a
                href={`https://www.imdb.com/name/${person.imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-1 rounded-pill border border-warning/30 bg-warning-soft px-3 py-1.5 font-semibold text-rating transition-all hover:bg-warning-soft"
                title="View on IMDb"
              >
                <span>IMDb</span>
                <IconExternalLink size={12} className="opacity-80" />
              </a>
            )}

            {person.homepage && (
              <a
                href={person.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-surface-soft px-3 py-1.5 text-ink-secondary transition-all hover:bg-surface-soft-hover"
                title="Official Website"
              >
                <IconGlobe size={13} className="text-accent-ink" />
                <span>Website</span>
                <IconExternalLink size={11} className="opacity-70" />
              </a>
            )}
          </div>

          {/* Biography */}
          <div className="space-y-2 pt-1">
            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-ink-muted uppercase">
              <IconSparkles size={13} className="text-accent-ink" />
              <span>Biography</span>
            </h4>

            <PersonDetailsBiography biography={person.biography} />
          </div>
        </div>
      </div>
    </div>
  );
};
