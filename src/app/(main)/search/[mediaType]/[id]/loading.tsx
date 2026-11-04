import { Skeleton } from '@/shared/ui/Skeleton';

const TitleDetailsLoading = () => (
  <article
    id="title-details-skeleton"
    aria-busy="true"
    aria-label="Loading title details"
    className="animate-fade-in mx-auto w-full space-y-8 pb-12 font-sans select-none"
  >
    <div className="flex items-center justify-between border-b border-white/8 pb-3">
      <Skeleton className="h-8 w-32 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>

    <div className="glass-panel flex flex-col gap-8 rounded-3xl p-6 sm:p-8 md:flex-row">
      <Skeleton className="aspect-2/3 w-full shrink-0 rounded-2xl md:w-56" />
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-2/3 rounded-xl" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-11/12 rounded-md" />
          <Skeleton className="h-3.5 w-4/5 rounded-md" />
          <Skeleton className="h-3.5 w-2/3 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
    </div>

    <div className="space-y-4">
      <Skeleton className="h-5 w-40 rounded-md" />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <li key={item}>
            <Skeleton className="aspect-2/3 w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export default TitleDetailsLoading;
