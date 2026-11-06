export type ErrorStateProps = {
  /** Defaults to "Something went wrong". */
  title?: string;
  /** Defaults to a neutral, non-technical explanation. */
  description?: string;
  /** Retries the failed render (usually the error boundary's `reset`). */
  onRetry?: () => void;
  backHref?: string;
  backLabel?: string;
  /** Short support reference (Next's error digest); never a stack trace. */
  digest?: string;
  className?: string;
};
