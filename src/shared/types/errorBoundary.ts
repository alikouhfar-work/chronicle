export type ErrorBoundaryProps = {
  error: Error;
  reset: () => void;
  onBack?: () => void;
};
