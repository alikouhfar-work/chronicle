import { showStatusConfig } from '@/modules/show/lib/showStatusConfig';

type LibraryCardStatusProps = {
  status?: string;
};

export const LibraryCardStatus = ({ status }: LibraryCardStatusProps) => {
  const statusConfig = status && showStatusConfig[status as keyof typeof showStatusConfig];

  if (!statusConfig) return null;

  return (
    <span
      className={`apple-badge border bg-black/60 text-[10px] font-bold tracking-tight backdrop-blur-md ${statusConfig.colors}`}
    >
      {statusConfig.title}
    </span>
  );
};
