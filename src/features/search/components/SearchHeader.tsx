import React from 'react';

export const SearchHeader = () => {
  return (
    <section className="mx-auto max-w-xl space-y-2 text-center">
      <div className="apple-badge mx-auto border border-white/10 bg-white/6 text-zinc-300">
        <span>Global Search</span>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
        Find Any Movie or Series
      </h2>
      <p className="text-xs leading-relaxed font-normal text-zinc-400 md:text-sm">
        Explore global entertainment records to seamlessly add and track your favorite titles.
      </p>
    </section>
  );
};
