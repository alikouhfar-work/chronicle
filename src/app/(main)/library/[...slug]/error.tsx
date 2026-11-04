'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui/ErrorState';

type LibraryDetailsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const LibraryDetailsError = ({ error, reset }: LibraryDetailsErrorProps) => {
  useEffect(() => {
    console.error('Library details error boundary:', error);
  }, [error]);

  return (
    <ErrorState
      title="This title could not be loaded"
      description="The title, its seasons, or its reviews failed to load. Nothing was changed — retry, or go back to your library."
      digest={error.digest}
      onRetry={reset}
      backHref="/library"
      backLabel="Back to library"
      className="animate-fade-in my-8"
    />
  );
};

export default LibraryDetailsError;
