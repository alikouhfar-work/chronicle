import { IconChevronRight } from '@tabler/icons-react';

export const UpcomingMediaCardSkeleton = ({
  isFirst,
  isLast,
}: {
  isFirst: boolean;
  isLast: boolean;
}) => {
  return (
    <li className="relative flex items-stretch gap-3 transition-all duration-200 sm:gap-4">
      {/* Left Date Column */}
      <div className="flex shrink-0 flex-col justify-center py-3.5 text-right select-none">
        <div className="bg-gold-400/10 border-gold-400/25 h-2.75 w-5.5 animate-pulse rounded border" />
        <div className="bg-zinc-850 mt-2 h-4.5 w-5.5 animate-pulse rounded" />
      </div>

      {/* Timeline Node Axis with Center Spine */}
      <div className="relative flex shrink-0 flex-col items-center self-stretch">
        <div
          className={`w-px flex-1 ${isFirst ? 'bg-transparent' : 'bg-zinc-800 group-hover:bg-zinc-700'} transition-colors`}
        />
        <div className="border-gold-400 group-hover:border-gold-300 group-hover:bg-gold-400/30 z-10 my-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 bg-zinc-950 ring-4 ring-zinc-950 transition-all duration-200 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]">
          <div className="bg-gold-400 group-hover:bg-gold-300 h-1 w-1 rounded-full transition-colors" />
        </div>
        <div
          className={`w-px flex-1 ${isLast ? 'bg-transparent' : 'bg-zinc-800 group-hover:bg-zinc-700'} transition-colors`}
        />
      </div>

      {/* Right Timeline Card */}
      <div className="border-zinc-850/90 my-1.5 flex min-w-0 flex-1 flex-col justify-between gap-3 rounded-2xl border bg-zinc-900/40 p-3 shadow-sm transition-all duration-200 group-first:mt-0 group-last:mb-0 sm:my-2 sm:flex-row sm:items-center sm:gap-3.5 sm:p-3.5">
        {/* Artwork Preview Thumbnail */}
        <div className="flex min-w-0 flex-1 shrink-0 items-center gap-3">
          <div className="bg-zinc-850 h-15 w-10.5 animate-pulse rounded-xl" />

          {/* Title & Details */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2">
              <div className="bg-zinc-850 h-5 w-1/3 animate-pulse rounded" />
              <div className="text-gold-400 bg-gold-400/10 border-gold-400/25 h-5 w-15 shrink-0 animate-pulse rounded-full border" />
            </div>
            <div className="bg-zinc-850 h-4 w-2/3 animate-pulse rounded" />
            <div className="bg-zinc-850 h-4 w-full animate-pulse rounded" />
          </div>
        </div>

        {/* Interactive cue / link */}
        <div className="flex shrink-0 items-center gap-1 self-end pt-0.5 sm:self-center sm:pt-0">
          <div className="group-hover:text-gold-400 rounded-lg p-1 text-zinc-600 transition-all group-hover:translate-x-0.5">
            <IconChevronRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </li>
  );
};
