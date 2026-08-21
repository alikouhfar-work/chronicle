import { FC } from 'react';
import { LibraryItemFooterProps } from '@/app/(main)/library/[...slug]/_types/libraryItemFooter';
import { getPosterPlaceholderColor } from '@/app/(main)/(dashboard)/_utils/getPosterPlaceholderColor';
import { IconCircleCheck } from '@tabler/icons-react';
import { createMonogram } from '@/app/(main)/library/[...slug]/_utils/createMonogram';

export const LibraryItemFooter: FC<LibraryItemFooterProps> = ({ enrichment, isAlreadyTracked }) => {
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-emerald-950/40 to-teal-900/25 text-emerald-300 border-emerald-900/30',
      'from-blue-950/40 to-indigo-900/25 text-blue-300 border-blue-900/30',
      'from-amber-950/40 to-yellow-900/25 text-amber-300 border-amber-900/30',
      'from-rose-950/40 to-pink-900/25 text-rose-300 border-rose-900/30',
      'from-violet-950/40 to-fuchsia-900/25 text-violet-300 border-violet-900/30',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cast Members Column */}
      <div className="space-y-4 lg:col-span-1">
        <div className="space-y-1">
          <h4 className="flex items-center gap-2 font-serif text-sm font-black text-white">
            <span className="bg-gold-400 h-1.5 w-1.5 rounded-full" />
            <span>Key Cast & Crew</span>
          </h4>
          <p className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            Starring Performance List
          </p>
        </div>

        <div className="border-zinc-850/60 space-y-3 rounded-2xl border bg-zinc-900/25 p-4">
          {enrichment.cast.map((member) => (
            <div key={member.name} className="group/cast flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} group-hover/cast:border-gold-500/30 flex shrink-0 items-center justify-center border border-zinc-800/80 font-mono text-[10px] font-black text-zinc-100 shadow-inner transition-colors`}
              >
                {createMonogram(member.name)}
              </div>
              <div className="min-w-0">
                <p className="group-hover/cast:text-gold-300 truncate text-xs font-bold text-zinc-200 transition-colors">
                  {member.name}
                </p>
                <p className="truncate font-mono text-[10px] text-zinc-500">{member.character}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* You Might Also Like Column */}
      <div className="space-y-4 lg:col-span-2">
        <div className="space-y-1">
          <h4 className="flex items-center gap-2 font-serif text-sm font-black text-white">
            <span className="bg-gold-400 h-1.5 w-1.5 rounded-full" />
            <span>You Might Also Like</span>
          </h4>
          <p className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            Similar Curated Recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {enrichment.similar.map((sim) => {
            const tracked = isAlreadyTracked(sim.title, sim.type);
            return (
              <div
                key={sim.title}
                className="group/sim border-zinc-850/60 hover:border-zinc-750/80 relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-zinc-900/20 shadow-md transition-all duration-300 hover:bg-zinc-900/50"
              >
                {/* Miniature Cover Art Banner */}
                <div className="border-zinc-850/50 relative h-28 w-full shrink-0 overflow-hidden border-b select-none">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getPosterPlaceholderColor(sim.title)}`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_25%,rgba(9,9,11,0.95)_100%)]" />
                  <div className="absolute inset-0 bg-zinc-950/20" />
                  <div className="absolute inset-0 bg-white/[0.01] bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:10px_10px]" />

                  {/* Content overlays on mini cover banner */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-between p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded border border-zinc-900/80 bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[7px] leading-none font-bold text-zinc-300 uppercase">
                        {sim.type === 'show' ? 'Series' : 'Movie'}
                      </span>
                      <span className="rounded border border-zinc-900/30 bg-zinc-950/60 px-1.5 py-0.5 font-mono text-[7px] leading-none font-bold text-zinc-300">
                        {sim.year}
                      </span>
                    </div>

                    <h5 className="group-hover/sim:text-gold-300 truncate font-serif text-xs leading-tight font-black text-white drop-shadow transition-colors">
                      {sim.title}
                    </h5>
                  </div>
                </div>

                {/* Card Content & Action Button */}
                <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                  <p className="line-clamp-3 font-sans text-[10px] leading-relaxed font-light text-zinc-400">
                    {sim.synopsis}
                  </p>

                  <div className="border-zinc-850/30 border-t pt-2">
                    {tracked ? (
                      <span className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900/10 py-1.5 font-mono text-[8px] font-bold text-zinc-500">
                        <IconCircleCheck size={10} className="text-emerald-500" />
                        <span>In Library</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => console.log('Add Suggested Media')}
                        // onClick={() => handleAddSuggestedMedia(sim)}
                        className="bg-gold-400/10 hover:bg-gold-400/25 text-gold-400 hover:text-gold-300 border-gold-400/20 w-full cursor-pointer rounded-lg border py-2 text-center font-mono text-[9px] font-bold tracking-wider uppercase transition-colors"
                      >
                        + Add To Tracker
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
