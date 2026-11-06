import { showStatusConfig } from '@/modules/show/lib/showStatusConfig';
import type { LibraryCardStatusProps } from '@/modules/library/types/libraryCardStatus';

export const LibraryCardStatus = ({ status }: LibraryCardStatusProps) => {
  const statusConfig = status && showStatusConfig[status as keyof typeof showStatusConfig];

  if (!statusConfig) return null;

  return (
    <span
      className={`apple-badge border bg-black/60 text-micro font-bold tracking-tight backdrop-blur-md ${statusConfig.colors}`}
    >
      {statusConfig.title}
    </span>
  );
};
