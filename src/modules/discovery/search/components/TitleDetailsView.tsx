import { IconDeviceTv, IconMovie, IconStar } from '@tabler/icons-react';
import Link from 'next/link';
import type { Credits } from '@/modules/discovery/credit';
import type { SimilarMovie } from '@/modules/movie';
import type { SimilarShow } from '@/modules/show';
import { MediaPosterImage } from '@/shared/ui/MediaPosterImage';
import { DetailsCastList } from '@/modules/library/components/details/DetailsCastList';
import { SimilarMediaCarousel } from '@/modules/library/components/details/SimilarMediaCarousel';
import { SearchResultCardActions } from '@/modules/discovery/search/components/SearchResultCardActions';
import { PersonDetailsBackButton } from '@/modules/discovery/person/components/PersonDetailsBackButton';
import type { TitleDetails } from '@/modules/discovery/search/types/titleDetails';

export type TitleDetailsViewProps = {
  details: TitleDetails;
  credits: Credits | null;
  similar: SimilarShow[] | SimilarMovie[];
  isTracked: boolean;
};

export const TitleDetailsView = ({
  details,
  credits,
  similar,
  isTracked,
}: TitleDetailsViewProps) => {
  const isMovie = details.mediaType === 'movie';
  const facts = [
    details.status,
    details.releaseLabel,
    details.runtimeLabel,
    details.seasonsLabel,
    details.networkLabel,
    details.languageLabel,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <article className="animate-fade-in mx-auto w-full max-w-7xl space-y-6 px-3 font-sans sm:px-6 lg:px-8">
      <PersonDetailsBackButton />

      <div className="glass-panel relative flex flex-col gap-7 overflow-hidden rounded-3xl border border-white/8 p-6 shadow-2xl md:flex-row md:p-8">
        <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="group relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl select-none md:w-56">
          <MediaPosterImage
            title={details.name}
            path={details.posterPath}
            alt={details.name}
            size="w500"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_35%,rgba(12,13,18,0.95)_100%)]" />

          <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="apple-badge border border-white/10 bg-black/60 text-[10px] text-zinc-300 backdrop-blur-md">
                {isMovie ? (
                  <IconMovie size={10} className="mr-1 text-violet-400" />
                ) : (
                  <IconDeviceTv size={10} className="mr-1 text-violet-400" />
                )}
                <span>{isMovie ? 'Movie' : 'Series'}</span>
              </span>
              {details.rating !== null && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
                  <IconStar size={10} className="fill-amber-400 text-amber-400" />
                  <span>{details.rating.toFixed(1)}</span>
                </span>
              )}
            </div>

            <h3 className="text-base leading-tight font-bold text-white">{details.name}</h3>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-white md:text-3xl">
                  {details.name}
                </h2>
                <span className="text-sm font-semibold text-violet-400">({details.year})</span>
              </div>
              {details.tagline && (
                <p className="text-xs text-zinc-400 italic">&#34;{details.tagline}&#34;</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="apple-badge border border-white/10 bg-white/6 text-xs text-zinc-200"
                >
                  {fact}
                </span>
              ))}
              {details.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="apple-badge border border-violet-500/25 bg-violet-500/15 text-xs text-violet-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <h4 className="text-xs font-semibold text-violet-400">Overview</h4>
              <p className="text-xs leading-relaxed font-normal text-zinc-300 sm:text-sm">
                {details.overview || 'No synopsis available.'}
              </p>
            </div>
          </div>

          <div className="border-t border-white/8 pt-4">
            {isTracked ? (
              <Link
                href={`/library/${details.mediaType}/${details.tmdbId}`}
                className="apple-pill-btn inline-flex cursor-pointer items-center border border-white/8 bg-white/4 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                View in Library
              </Link>
            ) : (
              <div className="w-full max-w-xs">
                <SearchResultCardActions id={details.tmdbId} mediaType={details.mediaType} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DetailsCastList credits={credits} />
        {similar.length > 0 && <SimilarMediaCarousel similarMedia={similar} />}
      </div>
    </article>
  );
};
