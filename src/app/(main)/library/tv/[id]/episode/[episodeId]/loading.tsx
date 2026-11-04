import { Skeleton } from '@/shared/ui/Skeleton';

const EpisodeDetailsLoading = () => (
  <article
    id="episode-details-skeleton"
    aria-busy="true"
    aria-label="Loading episode"
    className="animate-fade-in mx-auto w-full space-y-8 pb-12 font-sans select-none"
  >
    <div className="flex items-center justify-between border-b border-white/8 pb-3">
      <Skeleton className="h-8 w-32 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>

    <div className="glass-panel space-y-4 rounded-3xl p-6 sm:p-8">
      <Skeleton className="h-3 w-40 rounded-md" />
      <Skeleton className="h-8 w-2/3 rounded-xl" />
      <div className="flex flex-wrap gap-2 pt-1">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-11/12 rounded-md" />
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex gap-2 border-b border-white/8 pb-2">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
    </div>
  </article>
);

export default EpisodeDetailsLoading;
