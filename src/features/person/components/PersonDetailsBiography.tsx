'use client';

import { FC, useState } from 'react';

export type PersonDetailsBiographyProps = {
  biography: string;
};

export const PersonDetailsBiography: FC<PersonDetailsBiographyProps> = ({ biography }) => {
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);

  return (
    <div className="max-w-3xl space-y-2 text-xs leading-relaxed font-normal text-zinc-300">
      {biography ? (
        <>
          <p className={isBioExpanded ? '' : 'line-clamp-4'}>{biography}</p>
          {biography.length > 280 && (
            <button
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="block cursor-pointer pt-1 text-xs font-semibold text-violet-400 transition-colors hover:text-violet-300"
            >
              {isBioExpanded ? 'Show less' : 'Read full biography...'}
            </button>
          )}
        </>
      ) : (
        <p className="text-zinc-500 italic">No extended biography recorded for this actor.</p>
      )}
    </div>
  );
};
