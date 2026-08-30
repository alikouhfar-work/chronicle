'use client';

import { FC, useState, useTransition } from 'react';
import { IconDeviceTv } from '@tabler/icons-react';
import { LibraryMediaDetailsHeader } from '@/features/library/components/LibraryMediaDetailsHeader';
import { LibraryShowDetailsProps } from '@/features/library/types/libraryShowDetails';
import { setSeasonWatched } from '@/features/show/actions/setSeasonWatched';
import { ShowDetailsEpisodeCard } from '@/features/show/components/ShowDetailsEpisodeCard';
import { LibraryItemFooter } from '@/features/library/components/LibraryItemFooter';
import { clsx } from 'clsx';

export const LibraryShowDetails: FC<LibraryShowDetailsProps> = ({ show, credits }) => {
  const [isSeasonPending, startSeasonTransition] = useTransition();
  const [activeSeason, setActiveSeason] = useState(show.seasons[0]);

  const handleWatchSeason = (seasonId: string) => {
    startSeasonTransition(async () => await setSeasonWatched(show.id, seasonId, true));
  };

  const handleClearSeason = async (seasonId: string) => {
    startSeasonTransition(async () => await setSeasonWatched(show.id, seasonId, false));
  };

  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 font-sans">
      {/* Toast Success Message */}
      {/*{toastMessage && (*/}
      {/*  <div className="animate-fade-in relative flex items-center justify-between overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400">*/}
      {/*    <div className="pointer-events-none absolute -top-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />*/}
      {/*    <div className="flex items-center gap-2">*/}
      {/*      <IconCircleCheck size={14} className="shrink-0 text-emerald-400" />*/}
      {/*      <span>{toastMessage}</span>*/}
      {/*    </div>*/}
      {/*    <button*/}
      {/*      onClick={() => setToastMessage(null)}*/}
      {/*      className="cursor-pointer text-[9px] font-bold text-emerald-500 uppercase hover:text-emerald-300"*/}
      {/*    >*/}
      {/*      Dismiss*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*)}*/}
      <LibraryMediaDetailsHeader media={show} />

      {/* Editing Episode thoughts overlay */}
      {/*{editingEpisode && show && (*/}
      {/*  <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 p-4 font-sans backdrop-blur-md">*/}
      {/*    <div className="relative w-full max-w-md space-y-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-2xl">*/}
      {/*      <div className="bg-gold-500/5 pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full blur-3xl" />*/}

      {/*      <h3 className="flex items-center gap-2 font-serif text-base font-black text-white">*/}
      {/*        <IconDeviceTv size={16} className="text-gold-400" />*/}
      {/*        <span className="truncate">*/}
      {/*          S{editingEpisode.seasonNum}E{editingEpisode.epNum} -{' '}*/}
      {/*          {show.seasons*/}
      {/*            .find((s) => s.seasonNumber === editingEpisode.seasonNum)*/}
      {/*            ?.episodes.find((e) => e.episodeNumber === editingEpisode.epNum)?.name ||*/}
      {/*            'Episode'}*/}
      {/*        </span>*/}
      {/*      </h3>*/}

      {/*      /!* Star Selector *!/*/}
      {/*      <div className="space-y-2">*/}
      {/*        <label className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">*/}
      {/*          Episode Rating*/}
      {/*        </label>*/}
      {/*        <div className="flex w-fit items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900/40 p-2">*/}
      {/*          {[1, 2, 3, 4, 5].map((star) => (*/}
      {/*            <button*/}
      {/*              key={star}*/}
      {/*              type="button"*/}
      {/*              onClick={() => setEpRating(star)}*/}
      {/*              className="cursor-pointer p-1 transition-all duration-200 hover:scale-110 active:scale-95"*/}
      {/*            >*/}
      {/*              <IconStar*/}
      {/*                className={*/}
      {/*                  star <= epRating*/}
      {/*                    ? 'text-gold-400 fill-gold-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.2)]'*/}
      {/*                    : 'text-zinc-800 hover:text-zinc-600'*/}
      {/*                }*/}
      {/*                size={22}*/}
      {/*              />*/}
      {/*            </button>*/}
      {/*          ))}*/}
      {/*        </div>*/}
      {/*      </div>*/}

      {/*      /!* Episode Notes *!/*/}
      {/*      <div className="space-y-2">*/}
      {/*        <label className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">*/}
      {/*          Your Notes / Thoughts*/}
      {/*        </label>*/}
      {/*        <textarea*/}
      {/*          value={epNotes}*/}
      {/*          onChange={(e) => setEpNotes(e.target.value)}*/}
      {/*          placeholder="Write down any quotes, twists, or thoughts on this specific episode..."*/}
      {/*          rows={4}*/}
      {/*          className="hover:border-zinc-750 focus:border-gold-400/80 focus:ring-gold-400/10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-sans text-xs leading-relaxed text-zinc-100 focus:ring-1 focus:outline-none"*/}
      {/*        />*/}
      {/*      </div>*/}

      {/*      <div className="flex justify-end gap-3 pt-2">*/}
      {/*        <button*/}
      {/*          onClick={() => setEditingEpisode(null)}*/}
      {/*          className="cursor-pointer rounded-xl border border-zinc-800/85 bg-zinc-900 px-4 py-2.5 font-mono text-xs tracking-widest text-zinc-300 uppercase transition-colors hover:bg-zinc-800"*/}
      {/*        >*/}
      {/*          Cancel*/}
      {/*        </button>*/}
      {/*        <button*/}
      {/*          // onClick={handleSaveEpNotes}*/}
      {/*          className="bg-gold-400 hover:bg-gold-300 shadow-gold-500/10 cursor-pointer rounded-xl px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-md transition-colors"*/}
      {/*        >*/}
      {/*          Save Review*/}
      {/*        </button>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Show Seasons & Episode tracking section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Seasons list selectors */}
        <div className="shrink-0 space-y-3">
          <h4 className="text-xs font-bold tracking-tight text-zinc-400 uppercase">Seasons</h4>
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
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
                  className={`group/season relative flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-xs font-semibold whitespace-nowrap transition-all duration-150 not-disabled:cursor-pointer disabled:opacity-50 md:whitespace-normal ${
                    activeSeason.id === season.id
                      ? 'border-white bg-white font-bold text-zinc-950 shadow-lg'
                      : 'glass-card text-zinc-400 not-disabled:hover:border-white/20 not-disabled:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconDeviceTv
                      size={14}
                      className={
                        activeSeason.id === season.id ? 'text-zinc-950' : 'text-violet-400'
                      }
                    />
                    <span>{season.name}</span>
                  </div>

                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      isUpcomingSeason
                        ? 'border-violet-400/10 bg-violet-400/5 font-bold text-violet-400/70'
                        : isCompleted
                          ? activeSeason.id === season.id
                            ? 'bg-black/20 text-zinc-950'
                            : 'border border-violet-500/30 bg-violet-500/20 text-violet-300'
                          : activeSeason.id === season.id
                            ? 'bg-black/20 text-zinc-950'
                            : 'bg-white/6 text-zinc-400',
                    )}
                  >
                    {isUpcomingSeason ? 'Upcoming' : `${watchedEpisodes}/${totalEpisodes}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Episode Checklists for selected season */}
        <div className="space-y-3.5 md:col-span-3">
          <div className="flex items-center justify-between border-b border-white/8 pb-2">
            <h4 className="text-base font-bold text-white">{activeSeason.name} Episodes</h4>
            <div className="flex items-center gap-1.5">
              <button
                disabled={isSeasonPending}
                onClick={() => handleWatchSeason(activeSeason.id)}
                className="apple-pill-btn cursor-pointer border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs text-violet-300 hover:bg-violet-500/25 disabled:cursor-wait disabled:opacity-50"
              >
                Mark All Watched
              </button>
              <button
                disabled={isSeasonPending}
                onClick={() => handleClearSeason(activeSeason.id)}
                className="apple-pill-btn cursor-pointer bg-white/6 px-3 py-1 text-xs text-zinc-400 hover:bg-white/12 hover:text-white disabled:cursor-wait disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Episodes check list */}
          <ul className="space-y-2">
            {show.seasons
              .find((s) => s.id === activeSeason.id)
              ?.episodes.map((episode) => (
                <ShowDetailsEpisodeCard
                  showId={show.id}
                  episode={episode}
                  key={`${activeSeason.id}-${episode.episodeNumber}`}
                />
              ))}
          </ul>
        </div>
      </div>

      <LibraryItemFooter credits={credits} />
    </article>
  );
};
