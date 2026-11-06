import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { IconCalendar, IconClock, IconMessage } from '@tabler/icons-react';
import { getTrackedEpisode } from '@/modules/episode-season/services/getTrackedEpisode';
import { getEpisodeDetails } from '@/modules/episode-season/services/getEpisodeDetails';
import { getCommentViewer } from '@/modules/comments/services/getCommentViewer';
import { MediaCommentTabs } from '@/modules/comments/components/MediaCommentTabs';
import { MediaCommentTabsSkeleton } from '@/modules/comments/components/MediaCommentTabsSkeleton';
import { listComments } from '@/modules/comments/services/listComments';
import { toInitialCommentPage } from '@/modules/comments/lib/toInitialCommentPage';
import { DEFAULT_COMMENT_LIMIT } from '@/modules/comments/constants';
import { listNotes } from '@/modules/notes/services/listNotes';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { formatMinutes } from '@/shared/lib/formatMinutes';
import { BackButton } from '@/shared/ui/BackButton';

import type { EpisodePageProps } from '@/modules/episode-season/types/episodePage';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: EpisodePageProps): Promise<Metadata> => {
  try {
    const { id, episodeId } = await params;
    const details = await getEpisodeDetails(id, episodeId);
    if (!details) return {};
    return {
      title: `${details.episode.name} · ${details.show.name}`,
      description: details.episode.overview || `Episode discussion for ${details.show.name}.`,
    };
  } catch {
    return {};
  }
};

const EpisodePage = async ({ params }: EpisodePageProps) => {
  const { id, episodeId } = await params;
  const viewer = await getCommentViewer();
  const details = viewer
    ? await getTrackedEpisode(id, episodeId)
    : await getEpisodeDetails(id, episodeId);
  if (!details) notFound();

  const { show, season, episode } = details;
  const initialReviews = toInitialCommentPage(
    await listComments('episode', episode.tmdbId, undefined, DEFAULT_COMMENT_LIMIT),
  );
  const backdropUrl = getTmdbImageUrl(show.backdropPath, 'backdrop', 'w1280');
  const posterUrl = getTmdbImageUrl(show.posterPath, 'poster', 'w342');
  const rating = viewer ? (episode.tracking?.rating ?? null) : null;
  const notes = viewer ? await listNotes('episode', episode.tmdbId) : null;

  return (
    <article className="animate-fade-in mx-auto w-full max-w-7xl space-y-6 pb-12 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton href={`/library/tv/${show.tmdbId}`} label={`Back to ${show.name}`} />
        <span className="apple-badge border border-violet-500/25 bg-violet-500/10 text-[11px] text-violet-300">
          Season {season.seasonNumber} • Episode {episode.episodeNumber}
        </span>
      </div>

      <section className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 p-5 sm:p-7">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="pointer-events-none object-cover opacity-15"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-zinc-950/90 via-zinc-950/60 to-transparent" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt={show.name}
              width={120}
              height={180}
              className="hidden shrink-0 rounded-2xl border border-white/10 object-cover shadow-2xl sm:block"
            />
          )}

          <div className="min-w-0 flex-1 space-y-3">
            <Link
              href={`/library/tv/${show.tmdbId}`}
              className="text-xs font-bold tracking-wide text-violet-300 uppercase hover:text-violet-200"
            >
              {show.name}
            </Link>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {episode.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-300">
              {episode.airDate && (
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar size={14} className="text-zinc-500" />
                  {format(episode.airDate, 'PPP')}
                </span>
              )}
              {episode.runtime ? (
                <span className="inline-flex items-center gap-1.5">
                  <IconClock size={14} className="text-zinc-500" />
                  {formatMinutes(episode.runtime)}
                </span>
              ) : null}

              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <IconMessage size={14} className="text-zinc-500" />
                Episode discussion
              </span>
            </div>

            {episode.overview && (
              <p className="max-w-3xl text-sm leading-relaxed text-zinc-300">{episode.overview}</p>
            )}
          </div>
        </div>
      </section>

      <Suspense fallback={<MediaCommentTabsSkeleton />}>
        <MediaCommentTabs
          mediaType="episode"
          tmdbId={episode.tmdbId}
          personalNotes={
            viewer
              ? {
                  // The episode page is scoped to the tracked episode, so the
                  // rating target is always its tracking row.
                  rating,
                  ratingTargetId: episode.id,
                }
              : undefined
          }
          viewer={viewer}
          initialNotes={notes?.success ? notes.notes : undefined}
          initialReviews={initialReviews}
        />
      </Suspense>
    </article>
  );
};

export default EpisodePage;
