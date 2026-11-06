'use client';

import { useState } from 'react';
import type { PersonDetailsBiographyProps } from '@/modules/discovery/person/types/personDetailsBiography';

export const PersonDetailsBiography = ({ biography }: PersonDetailsBiographyProps) => {
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);

  return (
    <div className="space-y-2 text-xs leading-relaxed font-normal text-ink-secondary">
      {biography ? (
        <>
          <p className={isBioExpanded ? '' : 'line-clamp-4'}>{biography}</p>
          {biography.length > 280 && (
            <button
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="block cursor-pointer pt-1 text-xs font-semibold text-accent-ink transition-colors hover:text-accent-ink"
            >
              {isBioExpanded ? 'Show less' : 'Read full biography...'}
            </button>
          )}
        </>
      ) : (
        <p className="text-ink-subtle italic">No extended biography recorded for this actor.</p>
      )}
    </div>
  );
};
