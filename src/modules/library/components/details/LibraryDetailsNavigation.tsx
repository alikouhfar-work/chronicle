import { BackButton } from '@/shared/ui/BackButton';
import type { LibraryDetailsNavigationProps } from '@/modules/library/types/libraryDetailsNavigation';

export const LibraryDetailsNavigation = ({ actions }: LibraryDetailsNavigationProps) => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
      <BackButton href="/library" label="Back to Library" />
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
};
