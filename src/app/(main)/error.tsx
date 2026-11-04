'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui/ErrorState';

type MainErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const MainError = ({ error, reset }: MainErrorProps) => {
  useEffect(() => {
    // Diagnostics belong in the console/log sink, never in the user's face.
    console.error('Route error boundary:', error);
  }, [error]);

  return (
    <ErrorState
      digest={error.digest}
      onRetry={reset}
      backHref="/library"
      backLabel="Back to library"
      className="animate-fade-in"
    />
  );
};

export default MainError;
