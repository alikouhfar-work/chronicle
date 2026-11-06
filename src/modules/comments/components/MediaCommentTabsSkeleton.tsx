import { IconMessage } from '@tabler/icons-react';

/**
 * Stable-size fallback for the Suspense boundary around MediaCommentTabs.
 * Matches the tab strip and reserved panel height so hydration does not shift
 * the page.
 */
export const MediaCommentTabsSkeleton = () => (
  <section className="w-full" aria-label="Loading comments" aria-busy="true">
    <div className="flex items-center gap-2 border-b border-line pb-3">
      <div className="h-8 w-32 animate-pulse rounded-pill bg-accent-bright/25 motion-reduce:animate-none" />
      <div className="h-8 w-32 animate-pulse rounded-pill bg-surface-soft motion-reduce:animate-none" />
    </div>
    <div className="mt-4 min-h-[26rem] space-y-4 sm:min-h-[28rem]">
      <div className="glass-card flex items-center gap-2 rounded-card border border-line p-5 text-xs text-ink-subtle">
        <IconMessage size={15} />
        Loading the discussion…
      </div>
      <div className="glass-card h-36 animate-pulse rounded-card border border-line motion-reduce:animate-none" />
    </div>
  </section>
);

export default MediaCommentTabsSkeleton;
