import React from 'react';

export const SearchHeader = () => {
  return (
    <section className="mx-auto max-w-xl space-y-2 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-white">Search & Track Anything</h2>
      <p className="text-xs text-zinc-400">
        Enter any TV show or movie. Chronicle uses Gemini&#39;s intelligence to instantly extract
        seasons, episodes, synopsis, runtimes, and exact metadata.
      </p>
    </section>
  );
};
