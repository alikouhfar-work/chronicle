import { Skeleton } from '@/shared/ui/Skeleton';

const TitleDetailsLoading = () => (
  <article
    id="title-details-skeleton"
    aria-busy="true"
    aria-label="Loading title details"
    className="animate-fade-in mx-auto w-full space-y-8 pb-12 font-sans select-none"
  >
    <div className="flex items-center justify-between border-b border-line pb-3">
      <Skeleton className="h-8 w-32 rounded-pill" />
      <Skeleton className="h-6 w-24 rounded-pill" />
    </div>

    <div className="glass-panel flex flex-col gap-8 rounded-card p-6 sm:p-8 md:flex-row">
      <Skeleton className="aspect-2/3 w-full shrink-0 rounded-card md:w-56" />
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-2/3 rounded-control" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-pill" />
          <Skeleton className="h-6 w-24 rounded-pill" />
          <Skeleton className="h-6 w-16 rounded-pill" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full rounded-xs" />
          <Skeleton className="h-3.5 w-11/12 rounded-xs" />
          <Skeleton className="h-3.5 w-4/5 rounded-xs" />
          <Skeleton className="h-3.5 w-2/3 rounded-xs" />
        </div>
        <Skeleton className="h-10 w-40 rounded-pill" />
      </div>
    </div>

    <div className="space-y-4">
      <Skeleton className="h-5 w-40 rounded-xs" />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <li key={item}>
            <Skeleton className="aspect-2/3 w-full rounded-card" />
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export default TitleDetailsLoading;
