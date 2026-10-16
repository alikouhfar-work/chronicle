export const LibraryDetailsNavigationSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
      <div className="flex items-center gap-2 rounded-full bg-white/6 px-4 py-2">
        <div className="h-4 w-4 animate-pulse rounded-full bg-zinc-700" />
        <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-700" />
      </div>
      {/* Mobile actions menu trigger (sm:hidden on the live row) */}
      <div className="shrink-0 sm:hidden">
        <div className="h-8 w-8 animate-pulse rounded-full border border-white/10 bg-white/[0.04]" />
      </div>
    </div>
  );
};
