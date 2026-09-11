import { FC } from 'react';
import {
  IconCalendar,
  IconExternalLink,
  IconGlobe,
  IconMapPin,
  IconSparkles,
} from '@tabler/icons-react';
import { PersonDetailsBiography } from '@/features/person/components/PersonDetailsBiography';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { formatBirthInfo } from '@/features/person/utils/formatBirthInfo';
import { getGenderLabel } from '@/features/person/utils/getGenderLabel';
import { PersonDetailsHeroProps } from '@/features/person/types/personDetailsHero';

export const PersonDetailsHero: FC<PersonDetailsHeroProps> = ({ person, combinedCreditsCount }) => {
  const formattedBirthInfo = formatBirthInfo(person.birthday, person.deathday);
  const genderLabel = getGenderLabel(person.gender);

  return (
    <div className="glass-panel relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-8 md:flex-row">
      {/* Ambient Radial Lights */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Profile Image */}
      <div className="group relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl select-none md:w-60">
        {person.profilePath ? (
          <Image
            fill
            alt={person.name}
            src={getTmdbImageUrl(person.profilePath, 'backdrop', 'w500')!}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-zinc-800 via-zinc-900 to-violet-950/70 p-6 text-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/20 text-2xl font-bold text-violet-300 shadow-lg">
              {person.name
                .split(' ')
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')}
            </div>
            <p className="line-clamp-2 text-sm font-bold text-white">{person.name}</p>
          </div>
        )}

        <div className="from-canvas/90 pointer-events-none absolute inset-0 bg-linear-to-t via-transparent to-transparent" />

        {/* Quick overlay pill */}
        <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-center justify-between rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-md">
          <span>{genderLabel}</span>
          {combinedCreditsCount > 0 && (
            <span className="font-semibold text-violet-300">{combinedCreditsCount} Credits</span>
          )}
        </div>
      </div>

      {/* Personal Details Information */}
      <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5">
        <div className="space-y-4">
          {/* Name and Department Tag */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {person.name}
              </h2>
              <span className="apple-badge border border-violet-500/30 bg-violet-500/20 text-xs font-semibold text-violet-300">
                {person.knownForDepartment}
              </span>
            </div>
          </div>

          {/* Quick Meta Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {formattedBirthInfo && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300">
                <IconCalendar size={13} className="shrink-0 text-violet-400" />
                <span>{formattedBirthInfo}</span>
              </div>
            )}

            {person.placeOfBirth && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300">
                <IconMapPin size={13} className="shrink-0 text-violet-400" />
                <span className="max-w-50 truncate">{person.placeOfBirth}</span>
              </div>
            )}

            {person.imdbId && (
              <a
                href={`https://www.imdb.com/name/${person.imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 font-semibold text-amber-300 transition-all hover:bg-amber-500/25"
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
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 transition-all hover:bg-white/10"
                title="Official Website"
              >
                <IconGlobe size={13} className="text-violet-400" />
                <span>Website</span>
                <IconExternalLink size={11} className="opacity-70" />
              </a>
            )}
          </div>

          {/* Biography */}
          <div className="space-y-2 pt-1">
            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-zinc-400 uppercase">
              <IconSparkles size={13} className="text-violet-400" />
              <span>Biography</span>
            </h4>

            <PersonDetailsBiography biography={person.biography} />
          </div>
        </div>
      </div>
    </div>
  );
};
