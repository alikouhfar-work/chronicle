import { ReactNode } from 'react';

const LibraryDetailsLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  // The back navigation (with the mobile actions menu at its end) is
  // rendered by LibraryDetails itself, which owns the media data.
  return (
    <article className="animate-fade-in mx-auto max-w-5xl space-y-8 font-sans">
      {children}
    </article>
  );
};

export default LibraryDetailsLayout;
