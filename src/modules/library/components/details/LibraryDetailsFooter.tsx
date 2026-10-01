import type { LibraryDetailsFooterProps } from '@/modules/library/types/libraryDetailsFooter';
import { DetailsCastList } from '@/modules/library/components/details/DetailsCastList';
import { SimilarMediaCarousel } from '@/modules/library/components/details/SimilarMediaCarousel';

export const LibraryDetailsFooter = ({ credits, similarMedia }: LibraryDetailsFooterProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 border-t border-white/8 pt-4 lg:grid-cols-3">
      <DetailsCastList credits={credits} />
      <SimilarMediaCarousel similarMedia={similarMedia} />
    </div>
  );
};
