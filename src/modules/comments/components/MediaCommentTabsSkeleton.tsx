import { IconMessage } from '@tabler/icons-react';

/**
 * Stable-size fallback for the Suspense boundary around MediaCommentTabs.
 * Matches the tab strip and reserved panel height so hydration does not shift
 * the page.
 */
export const MediaCommentTabsSkeleton = () => (
  <section className="w-full" aria-label="Loading comments" aria-busy="true">
    <div className="flex items-center gap-2 border-b border-white/8 pb-3">
      <div className="h-8 w-32 animate-pulse rounded-full bg-violet-500/25 motion-reduce:animate-none" />
      <div className="h-8 w-32 animate-pulse rounded-full bg-white/6 motion-reduce:animate-none" />
    </div>
    <div className="mt-4 min-h-[26rem] space-y-4 sm:min-h-[28rem]">
      <div className="glass-card flex items-center gap-2 rounded-3xl border border-white/10 p-5 text-xs text-zinc-500">
        <IconMessage size={15} />
        Loading the discussion…
      </div>
      <div className="glass-card h-36 animate-pulse rounded-3xl border border-white/10 motion-reduce:animate-none" />
    </div>
  </section>
);

export default MediaCommentTabsSkeleton;
