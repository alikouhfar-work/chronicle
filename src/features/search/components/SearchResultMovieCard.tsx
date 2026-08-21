const renderMovieCard = (item: TMDBMovieResult) => {
  const trackedMatch = getTrackedMovieMatch(item);
  const releaseYear = item.release_date ? item.release_date.substring(0, 4) : 'N/A';
  const countriesList =
    (item as any).origin_country || (item.origin_country ? item.origin_country : undefined);
  const countryFormatted = formatCountryBadge(countriesList, item.original_language);

  const genres = (item.genre_ids || [])
    .map((id) => TMDB_GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 2);

  const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;

  return (
    <div
      key={`movie_${item.id}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-md transition-all duration-300 hover:border-amber-500/40 hover:bg-zinc-900/90 hover:shadow-2xl"
    >
      {/* Poster Image Container - Compact 3:4 aspect ratio to optimize vertical height */}
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-zinc-950 select-none">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-br ${getGradientForTitle(item.title)} flex flex-col items-center justify-center p-3 text-center`}
          >
            <Film className="mb-1.5 text-amber-400 opacity-80" size={28} />
            <span className="line-clamp-2 font-serif text-xs font-bold text-white">
              {item.title}
            </span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex max-w-[80%] flex-wrap items-center gap-1">
          <span className="flex items-center gap-1 rounded-md border border-amber-400/40 bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-amber-400 uppercase shadow backdrop-blur-md">
            <Film size={9} />
            Movie
          </span>
          <span className="rounded-md border border-zinc-700/60 bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-zinc-300 shadow backdrop-blur-md">
            {releaseYear}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="border-gold-400/40 text-gold-400 absolute top-2 right-2 flex items-center gap-1 rounded-md border bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold shadow backdrop-blur-md">
          <Star size={10} className="fill-gold-400 text-gold-400" />
          <span>{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
        </div>
      </div>

      {/* Card Body - Streamlined height with tight rhythm */}
      <div className="flex flex-1 flex-col justify-between space-y-2 p-3.5">
        <div className="space-y-1.5">
          <h3 className="line-clamp-1 font-serif text-base leading-snug font-bold text-white transition-colors group-hover:text-amber-300">
            {item.title}
          </h3>

          {/* Sub-meta row: Country, Adult rating & Genres */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {countryFormatted && (
              <span className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[8.5px] text-zinc-300 uppercase">
                <Globe size={8.5} className="text-zinc-400" />
                {countryFormatted}
              </span>
            )}
            {item.adult ? (
              <span
                className="flex items-center gap-0.5 rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[8.5px] text-rose-300 uppercase"
                title="Adult Content (18+)"
              >
                <ShieldAlert size={8.5} className="text-rose-400" />
                18+
              </span>
            ) : (
              <span
                className="flex items-center gap-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8.5px] text-emerald-400 uppercase"
                title="General Audience"
              >
                <Sparkles size={8.5} className="text-emerald-400" />
                All Ages
              </span>
            )}
            {genres.map((g) => (
              <span
                key={g}
                className="rounded border border-zinc-800 bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[8.5px] text-zinc-400"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="line-clamp-2 pt-0.5 font-sans text-[11px] leading-snug text-zinc-400">
            {item.overview || 'No overview available.'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="border-zinc-850 flex items-center justify-between gap-1 border-t pt-2">
          {trackedMatch ? (
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-xs font-bold text-emerald-400">
                <Check size={11} /> {trackedMatch.trackedStatus}
              </span>
              <button
                onClick={() => onSelectMovie(trackedMatch)}
                className="text-gold-400 hover:text-gold-300 bg-zinc-850 cursor-pointer rounded-lg border border-zinc-700/50 px-2.5 py-1 font-mono text-xs transition-colors hover:bg-zinc-800"
              >
                View →
              </button>
            </div>
          ) : (
            <div className="grid w-full grid-cols-3 gap-1">
              <button
                onClick={() => handleAddMovie(item, 'Watching')}
                className="flex cursor-pointer items-center justify-center gap-0.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-1 py-1.5 font-mono text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/25"
                title="Track as Watching"
              >
                <Plus size={11} /> Watch
              </button>
              <button
                onClick={() => handleAddMovie(item, 'Plan to Watch')}
                className="bg-zinc-850 border-zinc-750 flex cursor-pointer items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 font-mono text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-800"
                title="Plan to Watch"
              >
                <Bookmark size={11} /> Plan
              </button>
              <button
                onClick={() => handleAddMovie(item, 'Completed')}
                className="flex cursor-pointer items-center justify-center gap-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-1 py-1.5 font-mono text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/25"
                title="Mark Watched"
              >
                <CheckCircle2 size={11} /> Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
