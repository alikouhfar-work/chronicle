/** Placeholder row shown while the review feed loads. */
export const CommentSkeleton = () => (
  <div className="glass-card space-y-3 rounded-card border border-line p-5">
    <div className="flex items-center gap-3">
      <div className="size-9 animate-pulse rounded-pill bg-surface-soft motion-reduce:animate-none" />
      <div className="space-y-1.5">
        <div className="h-3 w-28 animate-pulse rounded-xs bg-surface-soft motion-reduce:animate-none" />
        <div className="h-2.5 w-20 animate-pulse rounded-xs bg-surface-soft motion-reduce:animate-none" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full animate-pulse rounded-xs bg-surface-soft motion-reduce:animate-none" />
      <div className="h-3 w-4/5 animate-pulse rounded-xs bg-surface-soft motion-reduce:animate-none" />
    </div>
  </div>
);
