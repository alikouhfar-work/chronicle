import { Skeleton } from '@/shared/ui/Skeleton';

const EpisodeDetailsLoading = () => (
  <article
    id="episode-details-skeleton"
    aria-busy="true"
    aria-label="Loading episode"
    className="animate-fade-in mx-auto w-full space-y-8 pb-12 font-sans select-none"
  >
    <div className="flex items-center justify-between border-b border-line pb-3">
      <Skeleton className="h-8 w-32 rounded-pill" />
      <Skeleton className="h-6 w-24 rounded-pill" />
    </div>

    <div className="glass-panel space-y-4 rounded-card p-6 sm:p-8">
      <Skeleton className="h-3 w-40 rounded-xs" />
      <Skeleton className="h-8 w-2/3 rounded-control" />
      <div className="flex flex-wrap gap-2 pt-1">
        <Skeleton className="h-6 w-24 rounded-pill" />
        <Skeleton className="h-6 w-20 rounded-pill" />
        <Skeleton className="h-6 w-16 rounded-pill" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3.5 w-full rounded-xs" />
        <Skeleton className="h-3.5 w-11/12 rounded-xs" />
        <Skeleton className="h-3.5 w-4/5 rounded-xs" />
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex gap-2 border-b border-line pb-2">
        <Skeleton className="h-8 w-32 rounded-pill" />
        <Skeleton className="h-8 w-32 rounded-pill" />
      </div>
      <Skeleton className="h-28 w-full rounded-card" />
      <Skeleton className="h-28 w-full rounded-card" />
    </div>
  </article>
);

export default EpisodeDetailsLoading;
