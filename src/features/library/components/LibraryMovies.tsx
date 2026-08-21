import { IconDeviceTv } from '@tabler/icons-react';
import { LibraryGridShowCard } from '@/app/(main)/library/_components/LibraryGridShowCard';

export const LibraryShows = () => {
  return (
    <div className="space-y-5">
      <div className="border-zinc-850/80 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-gold-400/10 border-gold-400/20 text-gold-400 rounded-xl border p-2">
            <IconDeviceTv size={18} />
          </div>
          <div>
            <h3 className="flex items-center gap-2.5 font-serif text-xl font-extrabold tracking-tight text-white md:text-2xl">
              <span>TV Series</span>
              <span className="text-gold-400 bg-gold-400/10 border-gold-400/20 rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold">
                {shows.length}
              </span>
            </h3>
          </div>
        </div>
      </div>

      {shows.length === 0 ? (
        <div className="border-zinc-850/60 rounded-xl border bg-zinc-900/20 p-6 text-center">
          <p className="font-mono text-xs text-zinc-500">
            No TV Series found matching the current filter.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shows.map((show) => (
            <LibraryGridShowCard key={show.id} {...show} />
          ))}
        </ul>
      )}
    </div>
  );
}