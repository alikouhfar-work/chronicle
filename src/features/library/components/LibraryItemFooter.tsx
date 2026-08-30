import { FC } from 'react';
import { LibraryItemFooterProps } from '@/features/library/types/libraryItemFooter';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { createMonogram } from '@/utils/createMonogram';

export const LibraryItemFooter: FC<LibraryItemFooterProps> = ({ credits }) => {
  return (
    <div className="grid grid-cols-1 gap-6 border-t border-white/8 pt-4 lg:grid-cols-3">
      {/* Cast Members Column */}
      {credits && (
        <div className="space-y-3 lg:col-span-1">
          <div className="space-y-0.5">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              <span>Key Cast</span>
            </h4>
            <p className="text-xs text-zinc-400">Notable lead performances</p>
          </div>

          <ul className="glass-card space-y-3 rounded-2xl border border-white/8 p-4">
            {credits.cast.map((member) => (
              <li key={member.name} className="group/cast flex items-center gap-3">
                <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-xs font-bold text-zinc-200">
                  {member.profilePath ? (
                    <Image
                      fill
                      alt={member.name}
                      className="object-cover"
                      src={getTmdbImageUrl(member.profilePath, 'avatar', 'w300')!}
                    />
                  ) : (
                    createMonogram(member.name)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white transition-colors group-hover/cast:text-violet-300">
                    {member.name}
                  </p>
                  <p className="truncate text-[11px] text-zinc-400">{member.character}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* You Might Also Like Column */}
      <div className="space-y-3 lg:col-span-2">
        <div className="space-y-0.5">
          <h4 className="flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span>Recommended For You</span>
          </h4>
          <p className="text-xs text-zinc-400">Titles with similar themes and tone</p>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/*{enrichment.similar.map((sim) => {*/}
          {/*  const tracked = isAlreadyTracked(sim.title, sim.type);*/}
          {/*  return (*/}
          {/*    <li*/}
          {/*      key={sim.title}*/}
          {/*      className="group/sim glass-card flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] shadow-lg transition-all duration-200 hover:scale-[1.02]"*/}
          {/*    >*/}
          {/*      <div className="relative h-24 w-full shrink-0 overflow-hidden border-b border-white/[0.08] select-none">*/}
          {/*        <div*/}
          {/*          className={`absolute inset-0 bg-gradient-to-br ${getPosterPlaceholderColor(sim.title)}`}*/}
          {/*        />*/}
          {/*        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_25%,rgba(12,13,18,0.95)_100%)]" />*/}

          {/*        <div className="absolute inset-0 z-10 flex flex-col justify-between p-2.5">*/}
          {/*          <div className="flex items-start justify-between gap-2">*/}
          {/*            <span className="apple-badge border border-white/10 bg-black/60 text-[9px] text-zinc-300 backdrop-blur-md">*/}
          {/*              {sim.type === 'show' ? 'Series' : 'Film'}*/}
          {/*            </span>*/}
          {/*            <span className="rounded-full border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 backdrop-blur-md">*/}
          {/*              {sim.year}*/}
          {/*            </span>*/}
          {/*          </div>*/}

          {/*          <h5 className="truncate text-xs font-bold text-white transition-colors group-hover/sim:text-violet-300">*/}
          {/*            {sim.title}*/}
          {/*          </h5>*/}
          {/*        </div>*/}
          {/*      </div>*/}

          {/*      <div className="flex flex-1 flex-col justify-between gap-3 p-3">*/}
          {/*        <p className="line-clamp-3 text-xs leading-relaxed font-normal text-zinc-400">*/}
          {/*          {sim.synopsis}*/}
          {/*        </p>*/}

          {/*        <div className="border-t border-white/[0.08] pt-2">*/}
          {/*          {tracked ? (*/}
          {/*            <span className="flex items-center justify-center gap-1 rounded-full border border-violet-500/25 bg-violet-500/15 py-1 text-[11px] font-bold text-violet-400">*/}
          {/*              <CheckCircle2 size={12} className="text-violet-400" />*/}
          {/*              <span>In Library</span>*/}
          {/*            </span>*/}
          {/*          ) : (*/}
          {/*            <button*/}
          {/*              onClick={() => handleAddSuggestedMedia(sim)}*/}
          {/*              className="apple-pill-btn w-full cursor-pointer bg-violet-500 py-1.5 text-center text-xs font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:bg-violet-400"*/}
          {/*            >*/}
          {/*              + Add to Library*/}
          {/*            </button>*/}
          {/*          )}*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </li>*/}
          {/*  );*/}
          {/*})}*/}
        </ul>

        {/*<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">*/}
        {/*  {enrichment.similar.map((sim) => {*/}
        {/*    const tracked = isAlreadyTracked(sim.title, sim.type);*/}
        {/*    return (*/}
        {/*      <div*/}
        {/*        key={sim.title}*/}
        {/*        className="group/sim border-zinc-850/60 hover:border-zinc-750/80 relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-zinc-900/20 shadow-md transition-all duration-300 hover:bg-zinc-900/50"*/}
        {/*      >*/}
        {/*        /!* Miniature Cover Art Banner *!/*/}
        {/*        <div className="border-zinc-850/50 relative h-28 w-full shrink-0 overflow-hidden border-b select-none">*/}
        {/*          <div*/}
        {/*            className={`absolute inset-0 bg-gradient-to-br ${getPosterPlaceholderColor(sim.title)}`}*/}
        {/*          />*/}
        {/*          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)]" />*/}
        {/*          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_25%,rgba(9,9,11,0.95)_100%)]" />*/}
        {/*          <div className="absolute inset-0 bg-zinc-950/20" />*/}
        {/*          <div className="absolute inset-0 bg-white/[0.01] bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:10px_10px]" />*/}

        {/*          /!* Content overlays on mini cover banner *!/*/}
        {/*          <div className="absolute inset-0 z-10 flex flex-col justify-between p-3.5">*/}
        {/*            <div className="flex items-start justify-between gap-2">*/}
        {/*              <span className="rounded border border-zinc-900/80 bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[7px] leading-none font-bold text-zinc-300 uppercase">*/}
        {/*                {sim.type === 'show' ? 'Series' : 'Movie'}*/}
        {/*              </span>*/}
        {/*              <span className="rounded border border-zinc-900/30 bg-zinc-950/60 px-1.5 py-0.5 font-mono text-[7px] leading-none font-bold text-zinc-300">*/}
        {/*                {sim.year}*/}
        {/*              </span>*/}
        {/*            </div>*/}

        {/*            <h5 className="group-hover/sim:text-gold-300 truncate font-serif text-xs leading-tight font-black text-white drop-shadow transition-colors">*/}
        {/*              {sim.title}*/}
        {/*            </h5>*/}
        {/*          </div>*/}
        {/*        </div>*/}

        {/*        /!* Card Content & Action Button *!/*/}
        {/*        <div className="flex flex-1 flex-col justify-between gap-4 p-4">*/}
        {/*          <p className="line-clamp-3 font-sans text-[10px] leading-relaxed font-light text-zinc-400">*/}
        {/*            {sim.synopsis}*/}
        {/*          </p>*/}

        {/*          <div className="border-zinc-850/30 border-t pt-2">*/}
        {/*            {tracked ? (*/}
        {/*              <span className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900/10 py-1.5 font-mono text-[8px] font-bold text-zinc-500">*/}
        {/*                <IconCircleCheck size={10} className="text-emerald-500" />*/}
        {/*                <span>In Library</span>*/}
        {/*              </span>*/}
        {/*            ) : (*/}
        {/*              <button*/}
        {/*                onClick={() => console.log('Add Suggested Media')}*/}
        {/*                // onClick={() => handleAddSuggestedMedia(sim)}*/}
        {/*                className="bg-gold-400/10 hover:bg-gold-400/25 text-gold-400 hover:text-gold-300 border-gold-400/20 w-full cursor-pointer rounded-lg border py-2 text-center font-mono text-[9px] font-bold tracking-wider uppercase transition-colors"*/}
        {/*              >*/}
        {/*                + Add To Tracker*/}
        {/*              </button>*/}
        {/*            )}*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    );*/}
        {/*  })}*/}
        {/*</div>*/}
      </div>
    </div>
  );
};
