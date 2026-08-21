'use client';

import { FC, useState, useTransition } from 'react';
import { IconCircleCheck, IconDeviceTv, IconStar } from '@tabler/icons-react';
import { LibraryMediaDetailsHeader } from '@/features/library/components/LibraryMediaDetailsHeader';
import { LibraryShowDetailsProps } from '@/features/library/types/libraryShowDetails';
import { setSeasonWatched } from '@/features/show/actions/setSeasonWatched';
import { ShowDetailsEpisodeCard } from '@/features/show/components/ShowDetailsEpisodeCard';
import { LibraryItemFooter } from '@/features/library/components/LibraryItemFooter';

export const LibraryShowDetails: FC<LibraryShowDetailsProps> = ({ show, credits }) => {
  const [isSeasonPending, startSeasonTransition] = useTransition();
  // TV states
  const [activeSeason, setActiveSeason] = useState(show.seasons[0]);
  const [editingEpisode, setEditingEpisode] = useState<{ seasonNum: number; epNum: number } | null>(
    null,
  );
  const [epRating, setEpRating] = useState<number>(0);
  const [epNotes, setEpNotes] = useState<string>('');

  // Toast / notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // const enrichment = {
  //   cast,
  //   similar: isShow ? similarShows : similarMovies,
  // };
  const handleWatchSeason = (seasonId: string) => {
    startSeasonTransition(async () => await setSeasonWatched(show.id, seasonId, true));
  };

  const handleClearSeason = async (seasonId: string) => {
    startSeasonTransition(async () => await setSeasonWatched(show.id, seasonId, false));
  };

  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 font-sans">
      {/* Toast Success Message */}
      {toastMessage && (
        <div className="animate-fade-in relative flex items-center justify-between overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400">
          <div className="pointer-events-none absolute -top-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
          <div className="flex items-center gap-2">
            <IconCircleCheck size={14} className="shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="cursor-pointer text-[9px] font-bold text-emerald-500 uppercase hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}
      <LibraryMediaDetailsHeader media={show} />

      {/* Editing Episode thoughts overlay */}
      {editingEpisode && show && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-md">
          <div className="relative w-full max-w-md space-y-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-2xl">
            <div className="bg-gold-500/5 pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full blur-3xl" />

            <h3 className="flex items-center gap-2 font-serif text-base font-black text-white">
              <IconDeviceTv size={16} className="text-gold-400" />
              <span className="truncate">
                S{editingEpisode.seasonNum}E{editingEpisode.epNum} -{' '}
                {show.seasons
                  .find((s) => s.seasonNumber === editingEpisode.seasonNum)
                  ?.episodes.find((e) => e.episodeNumber === editingEpisode.epNum)?.name ||
                  'Episode'}
              </span>
            </h3>

            {/* Star Selector */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Episode Rating
              </label>
              <div className="flex w-fit items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900/40 p-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEpRating(star)}
                    className="cursor-pointer p-1 transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <IconStar
                      className={
                        star <= epRating
                          ? 'text-gold-400 fill-gold-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.2)]'
                          : 'text-zinc-800 hover:text-zinc-600'
                      }
                      size={22}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Episode Notes */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Your Notes / Thoughts
              </label>
              <textarea
                value={epNotes}
                onChange={(e) => setEpNotes(e.target.value)}
                placeholder="Write down any quotes, twists, or thoughts on this specific episode..."
                rows={4}
                className="hover:border-zinc-750 focus:border-gold-400/80 focus:ring-gold-400/10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-sans text-xs leading-relaxed text-zinc-100 focus:ring-1 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingEpisode(null)}
                className="cursor-pointer rounded-xl border border-zinc-800/85 bg-zinc-900 px-4 py-2.5 font-mono text-xs tracking-widest text-zinc-300 uppercase transition-colors hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                // onClick={handleSaveEpNotes}
                className="bg-gold-400 hover:bg-gold-300 shadow-gold-500/10 cursor-pointer rounded-xl px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-md transition-colors"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Seasons & Episode tracking section */}
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Seasons list selectors */}
        <div className="flex-1 space-y-3">
          <h4 className="font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
            Seasons
          </h4>
          <div className="custom-scrollbar flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
            {show.seasons.map((season) => {
              const totalEpisodes = season.episodeCount;
              const watchedEpisodes = season.episodes.filter(
                (episode) => episode.tracking?.watched,
              ).length;

              const isUpcomingSeason = !season.airDate || season.airDate > new Date();
              const isCompleted = totalEpisodes > 0 && watchedEpisodes === totalEpisodes;

              return (
                <button
                  key={season.id}
                  disabled={isUpcomingSeason}
                  onClick={() => setActiveSeason(season)}
                  className={`group/season relative flex items-center justify-between gap-2 overflow-hidden rounded-xl border py-3.5 pr-4 pl-6 text-left font-mono text-xs tracking-wider whitespace-nowrap uppercase transition-all duration-300 not-disabled:cursor-pointer md:whitespace-normal ${
                    isUpcomingSeason
                      ? 'cursor-not-allowed border-zinc-800/60 bg-zinc-950/40 text-zinc-600'
                      : activeSeason.id === season.id
                        ? 'from-gold-400/10 border-gold-400/40 bg-gradient-to-r via-zinc-900/60 to-zinc-900/20 text-white shadow-lg shadow-black/30'
                        : 'border-zinc-850 hover:border-zinc-750 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                  }`}
                >
                  {activeSeason.id === season.id && !isUpcomingSeason && (
                    <div className="bg-gold-400 animate-fade-in absolute top-3 bottom-3 left-0 w-0.75 rounded-r-full shadow-[0_0_8px_rgba(214,159,83,0.5)]" />
                  )}

                  <div className="flex items-center gap-2">
                    <IconDeviceTv
                      size={12}
                      className={`transition-colors duration-300 ${
                        isUpcomingSeason
                          ? 'text-zinc-700'
                          : activeSeason.id === season.id
                            ? 'text-gold-400'
                            : 'text-zinc-600 group-hover/season:text-zinc-400'
                      }`}
                    />

                    <span
                      className={`font-serif font-black tracking-tight transition-colors ${
                        isUpcomingSeason
                          ? 'text-zinc-600'
                          : activeSeason.id === season.id
                            ? 'text-gold-300'
                            : ''
                      }`}
                    >
                      {season.name}
                    </span>
                  </div>

                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[8.5px] transition-all ${
                      isUpcomingSeason
                        ? 'border-gold-400/10 bg-gold-400/5 text-gold-400/70 font-bold'
                        : isCompleted
                          ? 'border-emerald-500/20 bg-emerald-500/10 font-bold text-emerald-400'
                          : activeSeason.id === season.id
                            ? 'bg-gold-400/15 text-gold-400 border-gold-400/20 font-bold'
                            : 'border-zinc-900/40 bg-zinc-950/60 font-bold text-zinc-500'
                    }`}
                  >
                    {isUpcomingSeason ? 'Upcoming' : `${watchedEpisodes}/${totalEpisodes}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Episode Checklists for selected season */}
        <div className="space-y-4 md:flex-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-black text-white">
              {activeSeason.name} Episodes
            </h4>
            <div className="flex items-center gap-2">
              <button
                disabled={isSeasonPending}
                onClick={() => handleWatchSeason(activeSeason.id)}
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-[9px] tracking-widest text-zinc-300 uppercase transition-colors hover:bg-zinc-900 disabled:cursor-wait disabled:opacity-50"
              >
                Watch All
              </button>
              <button
                disabled={isSeasonPending}
                onClick={() => handleClearSeason(activeSeason.id)}
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-[9px] tracking-widest text-zinc-300 uppercase transition-colors hover:bg-zinc-900 disabled:cursor-wait disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Episodes check list */}
          <ul className="space-y-3 overflow-y-auto">
            {show.seasons
              .find((s) => s.id === activeSeason.id)
              ?.episodes.map((episode) => {
                const isWatched = episode.tracking?.watched ?? false;

                return (
                  <ShowDetailsEpisodeCard
                    showId={show.id}
                    episode={episode}
                    isWatched={isWatched}
                    key={`${activeSeason.id}-${episode.episodeNumber}`}
                  />
                );
              })}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-zinc-850/60 my-8 border-t" />

      <LibraryItemFooter credits={credits} />
    </article>
  );
};
