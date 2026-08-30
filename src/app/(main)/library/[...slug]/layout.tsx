import { ReactNode } from 'react';
import { LibraryItemNavigation } from '@/features/library/components/LibraryItemNavigation';

const LibraryItemLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <article className="animate-fade-in mx-auto max-w-5xl space-y-8 font-sans">
      <LibraryItemNavigation />
      {children}
    </article>
  );
};

export default LibraryItemLayout;
