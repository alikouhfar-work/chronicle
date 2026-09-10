import { FC } from 'react';
import { Person } from '@/features/person/types/person';
import {
  IconBookmark,
  IconCalendar,
  IconCircleCheck,
  IconDeviceTv,
  IconExternalLink,
  IconGlobe,
  IconMapPin,
  IconMovie,
  IconSparkles,
  IconStar,
} from '@tabler/icons-react';
import { PersonDetailsNavigation } from '@/features/person';
import { PersonDetailsBiography } from '@/features/person/components/PersonDetailsBiography';
import { CombinedCredit } from '@/features/person/types/combinedCredit';

export type PersonDetailsProps = {
  person: Person;
  combinedCredits: CombinedCredit[];
};

export const PersonDetails: FC<PersonDetailsProps> = ({ person, combinedCredits }) => {
  const profileImageUrl = person?.profilePath
    ? `https://image.tmdb.org/t/p/h632${person.profilePath}`
    : null;

  const getGenderLabel = (g: number) => {
    switch (g) {
      case 1:
        return 'Female';
      case 2:
        return 'Male';
      case 3:
        return 'Non-binary';
      default:
        return 'Not specified';
    }
  };

  const formatBirthInfo = () => {
    if (!person?.birthday) return null;
    try {
      const bDate = new Date(person.birthday);
      const bFormatted = bDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (person.deathday) {
        const dDate = new Date(person.deathday);
        const dFormatted = dDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        const ageAtDeath = dDate.getFullYear() - bDate.getFullYear();
        return `${bFormatted} – ${dFormatted} (Died at ${ageAtDeath})`;
      }

      const today = new Date();
      let age = today.getFullYear() - bDate.getFullYear();
      const mDiff = today.getMonth() - bDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < bDate.getDate())) {
        age--;
      }
      return `${bFormatted} (Age ${age})`;
    } catch {
      return person.birthday;
    }
  };

  if (person) {
    return (
      <article className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 pb-16 font-sans">
        <PersonDetailsNavigation person={person} />
        <div className="glass-panel relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-8 md:flex-row">
          {/* Ambient Radial Lights */}
          <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          {/* Profile Image */}
          <div className="group relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl select-none md:w-60">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={person.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-violet-950/70 p-6 text-center">
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

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0d12]/90 via-transparent to-transparent" />

            {/* Quick overlay pill */}
            <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-center justify-between rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-md">
              <span>{getGenderLabel(person.gender)}</span>
              {/*<span className="font-semibold text-violet-300">{credits.length} Credits</span>*/}
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
                {formatBirthInfo() && (
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-zinc-300">
                    <IconCalendar size={13} className="shrink-0 text-violet-400" />
                    <span>{formatBirthInfo()}</span>
                  </div>
                )}

                {person.placeOfBirth && (
                  <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-zinc-300">
                    <IconMapPin size={13} className="shrink-0 text-violet-400" />
                    <span className="max-w-[200px] truncate">{person.placeOfBirth}</span>
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
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-zinc-300 transition-all hover:bg-white/[0.1]"
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

        <div className="space-y-5 border-t border-white/[0.08] pt-4">
          {/* Section Header with Filters */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                <span>Filmography & Series</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Combined titles starring {person.name} ({combinedCredits.length} works total)
              </p>
            </div>

            {/* Filter and Search controls */}
            {/*<PersonDetailsCombinedCreditsFilter combinedCredits={combinedCredits} />*/}
          </div>

          {/* Filmography Cards Grid */}
          {combinedCredits.length === 0 ? (
            <div className="glass-card space-y-2 rounded-2xl border border-white/10 p-10 text-center">
              <IconMovie className="mx-auto mb-2 text-zinc-600" size={32} />
              <p className="text-sm font-semibold text-zinc-300">No matching works found</p>
              <p className="text-xs text-zinc-500">Try adjusting your filter or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {combinedCredits.map((credit) => {
                const title = credit.name || credit.name || 'Untitled';
                const releaseDate = credit.releaseDate;
                const year = releaseDate ? releaseDate.substring(0, 4) : '—';
                const posterUrl = credit.posterPath
                  ? `https://image.tmdb.org/t/p/w500${credit.posterPath}`
                  : null;
                const tracked = credit.isTracked;

                return (
                  <div
                    key={`${credit.mediaType}_${credit.id}_${credit.creditId || credit.character}`}
                    className="group glass-card flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] transition-all duration-300 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10"
                  >
                    {/* Poster Area */}
                    <div
                      // onClick={() => handleCardClick(credit)}
                      className="relative aspect-[2/3] w-full shrink-0 cursor-pointer overflow-hidden border-b border-white/[0.08] bg-zinc-950 select-none"
                    >
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-violet-950/40 p-3 text-center">
                          {credit.mediaType === 'movie' ? (
                            <IconMovie className="mb-1.5 text-violet-400 opacity-70" size={24} />
                          ) : (
                            <IconDeviceTv className="mb-1.5 text-violet-400 opacity-70" size={24} />
                          )}
                          <span className="line-clamp-2 text-xs font-bold text-white">{title}</span>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <span className="apple-badge border border-white/10 bg-black/60 text-[9px] text-zinc-300 backdrop-blur-md">
                          {credit.mediaType === 'movie' ? 'Film' : 'Series'}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                        <span className="rounded-full border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 backdrop-blur-md">
                          {year}
                        </span>
                      </div>

                      {/* Rating at bottom */}
                      {credit.rating > 0 && (
                        <div className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
                          <IconStar size={10} className="fill-amber-400 text-amber-400" />
                          <span>{credit.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
                      <div className="space-y-1">
                        <h4
                          // onClick={() => handleCardClick(credit)}
                          className="line-clamp-1 cursor-pointer text-xs leading-tight font-bold text-white transition-colors group-hover:text-violet-300"
                          title={title}
                        >
                          {title}
                        </h4>

                        {credit.character && (
                          <p
                            className="line-clamp-1 text-[11px] text-zinc-400"
                            title={credit.character}
                          >
                            as{' '}
                            <span className="font-medium text-violet-300">
                              &#34;{credit.character}&#34;
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="border-t border-white/[0.08] pt-2">
                        {tracked ? (
                          <button
                            // onClick={() => handleCardClick(credit)}
                            className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-full border border-violet-500/25 bg-violet-500/15 py-1.5 text-[11px] font-bold text-violet-300 transition-all hover:bg-violet-500/25"
                          >
                            <IconCircleCheck size={12} className="text-violet-400" />
                            <span>In Library</span>
                          </button>
                        ) : (
                          <button
                            // onClick={() => handleAddCreditToLibrary(credit)}
                            className="apple-pill-btn flex w-full cursor-pointer items-center justify-center gap-1.5 border border-white/10 bg-white/[0.06] py-1.5 text-center text-[11px] font-semibold text-zinc-300 shadow-sm transition-all hover:bg-violet-500 hover:text-white"
                          >
                            <IconBookmark size={12} />
                            <span>+ Library</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>
    );
  }
};
