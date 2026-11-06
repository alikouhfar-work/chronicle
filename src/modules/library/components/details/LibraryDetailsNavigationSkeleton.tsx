export const LibraryDetailsNavigationSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
      <div className="flex items-center gap-2 rounded-pill bg-surface-soft px-4 py-2">
        <div className="h-4 w-4 animate-pulse rounded-pill bg-surface-strong" />
        <div className="h-3.5 w-24 animate-pulse rounded-xs bg-surface-strong" />
      </div>
      {/* Mobile actions menu trigger (sm:hidden on the live row) */}
      <div className="shrink-0 sm:hidden">
        <div className="h-8 w-8 animate-pulse rounded-pill border border-line bg-white/[0.04]" />
      </div>
    </div>
  );
};
