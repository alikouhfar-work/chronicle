'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui/ErrorState';

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Fallback for routes outside the (main) group — sign-in, sign-up, and any
 * future top-level route. Without this they would fall through to the global
 * error page, which replaces the whole document chrome.
 */
const RootError = ({ error, reset }: RootErrorProps) => {
  useEffect(() => {
    console.error('Root error boundary:', error);
  }, [error]);

  return (
    <main className="bg-canvas flex min-h-screen items-center justify-center p-6 font-sans antialiased">
      <ErrorState
        title="Chronicle hit a problem"
        description="The page failed to load. Retry in a moment — if it keeps happening, signing in again usually clears it."
        digest={error.digest}
        onRetry={reset}
        backHref="/"
        backLabel="Go to dashboard"
        className="animate-fade-in"
      />
    </main>
  );
};

export default RootError;
