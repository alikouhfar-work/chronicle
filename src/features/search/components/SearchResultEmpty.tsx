import { IconHelpCircle } from '@tabler/icons-react';

const searchExamples = [
  'Severance',
  'The White Lotus',
  'The Bear',
  'Breaking Bad',
  'Succession',
  'Interstellar',
];

export const SearchResultEmpty = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <IconHelpCircle size={16} className="text-indigo-400" />
        <span>Search Ideas & Examples</span>
      </h4>

      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
        {searchExamples.map((title) => (
          <form key={title} method="GET">
            <input type="hidden" name="query" value={title} />

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl border border-zinc-800/80 bg-zinc-900/40 py-2.5 text-xs text-zinc-400 transition-all hover:bg-zinc-900/80 hover:text-zinc-200"
            >
              {title}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
};
