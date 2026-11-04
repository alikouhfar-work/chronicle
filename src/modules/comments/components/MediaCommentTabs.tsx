'use client';

import { useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PersonalNotesPanel } from '@/modules/comments/components/PersonalNotesPanel';
import { PublicReviewsPanel } from '@/modules/comments/components/PublicReviewsPanel';
import type {
  MediaCommentTab,
  MediaCommentTabsProps,
} from '@/modules/comments/types/mediaCommentTabs';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

const VALID_TABS: MediaCommentTab[] = ['personal', 'reviews'];

const TAB_LABELS: Record<MediaCommentTab, string> = {
  personal: 'Personal Notes',
  reviews: 'Public Reviews',
};

const TAB_IDS: Record<MediaCommentTab, string> = {
  personal: 'media-comments-tab-personal',
  reviews: 'media-comments-tab-reviews',
};

const PANEL_IDS: Record<MediaCommentTab, string> = {
  personal: 'media-comments-panel-personal',
  reviews: 'media-comments-panel-reviews',
};

const resolveTab = (value: string | null): MediaCommentTab =>
  value && VALID_TABS.includes(value as MediaCommentTab) ? (value as MediaCommentTab) : 'personal';

export const MediaCommentTabs = ({
  mediaType,
  tmdbId,
  personalNotes,
  viewer = null,
  personalNotesEditor,
  initialReviews,
}: MediaCommentTabsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = usePrefersReducedMotion();
  const tabRefs = useRef<Record<MediaCommentTab, HTMLButtonElement | null>>({
    personal: null,
    reviews: null,
  });

  const tabParam = searchParams.get('tab');
  const activeTab = resolveTab(tabParam);

  const selectTab = useCallback(
    (next: MediaCommentTab) => {
      if (next === activeTab) return;

      const params = new URLSearchParams(searchParams.toString());
      if (next === 'reviews') {
        params.set('tab', 'reviews');
      } else {
        params.delete('tab');
      }

      const query = params.toString();
      const hash = typeof window === 'undefined' ? '' : window.location.hash;
      const url = `${query ? `${pathname}?${query}` : pathname}${hash}`;
      router.push(url, { scroll: false });
    },
    [activeTab, pathname, router, searchParams],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const currentIndex = VALID_TABS.indexOf(activeTab);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % VALID_TABS.length;
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + VALID_TABS.length) % VALID_TABS.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = VALID_TABS.length - 1;

    const next = VALID_TABS[nextIndex];
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  const signInHref = `/login?callbackUrl=${encodeURIComponent(`${pathname}?tab=reviews`)}`;

  return (
    <section className="w-full" aria-label="Media comments and notes">
      <div
        role="tablist"
        aria-label="Media comment sections"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 border-b border-white/8 pb-3"
      >
        {VALID_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              ref={(element) => {
                tabRefs.current[tab] = element;
              }}
              id={TAB_IDS[tab]}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={PANEL_IDS[tab]}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectTab(tab)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors motion-reduce:transition-none ${
                isActive
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'text-zinc-400 hover:bg-white/6 hover:text-white'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {/*
        Both panels stay mounted so switching tabs never remounts the review
        feed. The reserved min-height keeps the section's footprint stable
        between the shorter Personal Notes panel and the review feed.
      */}
      <div className="mt-4 min-h-[26rem] sm:min-h-[28rem]">
        <div
          id={PANEL_IDS.personal}
          role="tabpanel"
          aria-labelledby={TAB_IDS.personal}
          tabIndex={0}
          hidden={activeTab !== 'personal'}
          className={activeTab === 'personal' && !reducedMotion ? 'animate-fade-in' : undefined}
        >
          <PersonalNotesPanel
            mediaType={mediaType}
            personalNotes={personalNotes}
            viewer={viewer}
            signInHref={signInHref}
            editor={personalNotesEditor}
          />
        </div>

        <div
          id={PANEL_IDS.reviews}
          role="tabpanel"
          aria-labelledby={TAB_IDS.reviews}
          tabIndex={0}
          hidden={activeTab !== 'reviews'}
          className={activeTab === 'reviews' && !reducedMotion ? 'animate-fade-in' : undefined}
        >
          <PublicReviewsPanel
            mediaType={mediaType}
            tmdbId={tmdbId}
            viewer={viewer}
            active={activeTab === 'reviews'}
            initialReviews={initialReviews}
          />
        </div>
      </div>
    </section>
  );
};

export default MediaCommentTabs;
