export const LibraryHeader = () => {
  return (
    <div className="border-b border-white/8 pb-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="apple-badge border border-white/10 bg-white/6 text-zinc-300">
          <span>Your Library</span>
        </div>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
        Cinema & Series Collection
      </h2>
      <p className="mt-1 text-xs leading-relaxed font-normal text-zinc-400 md:text-sm">
        Organize, filter, and review all your tracked television series and feature films.
      </p>
    </div>
  );
};
