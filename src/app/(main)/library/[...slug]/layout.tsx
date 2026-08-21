import { ReactNode } from 'react';
import { LibraryItemNavigation } from '@/app/(main)/library/[id]/_components/LibraryItemNavigation';

const LibraryItemLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 px-4 py-8 font-sans sm:px-6 lg:px-8">
      <LibraryItemNavigation />
      {children}
    </article>
  );
};

export default LibraryItemLayout;
