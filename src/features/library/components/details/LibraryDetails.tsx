import { FC } from 'react';
import { LibraryDetailsHeader } from '@/features/library/components/details/LibraryDetailsHeader';
import { LibraryShowDetailsProps } from '@/features/library/types/libraryDetails';
import { LibraryDetailsSeasons } from '@/features/library/components/details/LibraryDetailsSeasons';
import { LibraryDetailsFooter } from '@/features/library/components/details/LibraryDetailsFooter';

export const LibraryDetails: FC<LibraryShowDetailsProps> = ({ media, credits, similarMedia }) => {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 font-sans">
      {/* Toast Success Message */}
      {/*{toastMessage && (*/}
      {/*  <div className="animate-fade-in relative flex items-center justify-between overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400">*/}
      {/*    <div className="pointer-events-none absolute -top-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />*/}
      {/*    <div className="flex items-center gap-2">*/}
      {/*      <IconCircleCheck size={14} className="shrink-0 text-emerald-400" />*/}
      {/*      <span>{toastMessage}</span>*/}
      {/*    </div>*/}
      {/*    <button*/}
      {/*      onClick={() => setToastMessage(null)}*/}
      {/*      className="cursor-pointer text-[9px] font-bold text-emerald-500 uppercase hover:text-emerald-300"*/}
      {/*    >*/}
      {/*      Dismiss*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*)}*/}
      <LibraryDetailsHeader media={media} />

      {/* Show Seasons & Episode tracking section */}
      {'seasons' in media && <LibraryDetailsSeasons show={media} />}

      <LibraryDetailsFooter credits={credits} similarMedia={similarMedia} />
    </section>
  );
};
