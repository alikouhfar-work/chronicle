import { Skeleton } from '@/shared/ui/Skeleton';

const ProfileSettingsLoading = () => (
  <article
    id="profile-settings-skeleton"
    aria-busy="true"
    aria-label="Loading profile settings"
    className="animate-fade-in mx-auto w-full max-w-2xl space-y-6 font-sans select-none"
  >
    <Skeleton className="h-8 w-40 rounded-pill" />

    <div className="space-y-2">
      <Skeleton className="h-7 w-32 rounded-xs" />
      <Skeleton className="h-4 w-72 rounded-xs" />
    </div>

    <div className="glass-card space-y-6 rounded-card border-line p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 shrink-0 rounded-card" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 rounded-xs" />
          <Skeleton className="h-3 w-56 rounded-xs" />
        </div>
      </div>

      <div className="space-y-3 border-t border-line pt-6">
        <Skeleton className="h-5 w-32 rounded-xs" />
        <Skeleton className="h-10 w-full rounded-control" />
        <Skeleton className="h-9 w-28 rounded-pill" />
      </div>
    </div>

    <div className="glass-card space-y-4 rounded-card border-line p-6">
      <Skeleton className="h-5 w-24 rounded-xs" />
      <Skeleton className="h-3 w-full rounded-xs" />
      <Skeleton className="h-9 w-32 rounded-pill" />
    </div>
  </article>
);

export default ProfileSettingsLoading;
