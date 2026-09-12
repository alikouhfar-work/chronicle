import { ReactNode } from 'react';
import { LibraryDetailsNavigation } from '@/features/library';

const LibraryDetailsLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <article className="animate-fade-in mx-auto max-w-5xl space-y-8 font-sans">
      <LibraryDetailsNavigation />
      {children}
    </article>
  );
};

export default LibraryDetailsLayout;
