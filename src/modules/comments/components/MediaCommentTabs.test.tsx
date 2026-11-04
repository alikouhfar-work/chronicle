import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const push = vi.fn();
let currentParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/library/movie/550',
  useSearchParams: () => currentParams,
}));

vi.mock('@/shared/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => true,
}));

vi.mock('@/modules/notes/components/PersonalNotesPanel', () => ({
  PersonalNotesPanel: ({
    mediaType,
    tmdbId,
    rating,
    ratingTargetId,
    initialNotes,
  }: {
    mediaType: string;
    tmdbId: number;
    rating: number | null;
    ratingTargetId: string | null;
    initialNotes?: unknown[];
  }) => (
    <div
      data-testid="personal-panel"
      data-media={mediaType}
      data-tmdb={tmdbId}
      data-rating={rating ?? ''}
      data-rating-target={ratingTargetId ?? ''}
      data-notes={initialNotes?.length ?? 0}
    >
      Personal {mediaType}
    </div>
  ),
}));

vi.mock('@/modules/comments/components/PublicReviewsPanel', () => ({
  PublicReviewsPanel: ({
    mediaType,
    tmdbId,
    active,
  }: {
    mediaType: string;
    tmdbId: number;
    active: boolean;
  }) => (
    <div data-testid="reviews-panel" data-media={mediaType} data-tmdb={tmdbId} data-active={active}>
      Reviews
    </div>
  ),
}));

import { MediaCommentTabs } from '@/modules/comments/components/MediaCommentTabs';

const viewer = {
  id: 'user-1',
  username: 'viewer',
  name: 'Viewer',
  image: null,
};

describe('MediaCommentTabs', () => {
  beforeEach(() => {
    push.mockReset();
    currentParams = new URLSearchParams();
  });

  it('defaults to Personal Notes and passes the TMDB id to the review feed', () => {
    render(<MediaCommentTabs mediaType="movie" tmdbId={550} viewer={viewer} />);

    expect(screen.getByRole('tab', { name: 'Personal Notes' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('reviews-panel')).toHaveAttribute('data-tmdb', '550');
    expect(screen.getByTestId('reviews-panel')).toHaveAttribute('data-active', 'false');
  });

  it('hands the rating target and private notes to the Personal tab', () => {
    const note = {
      id: 'note-1',
      content: 'Quietly brilliant',
      createdAt: new Date('2026-11-01T10:00:00Z'),
      updatedAt: new Date('2026-11-01T10:00:00Z'),
    };

    render(
      <MediaCommentTabs
        mediaType="movie"
        tmdbId={550}
        viewer={viewer}
        personalNotes={{ rating: 4, ratingTargetId: 'movie-row-1' }}
        initialNotes={[note]}
      />,
    );

    const panel = screen.getByTestId('personal-panel');
    expect(panel).toHaveAttribute('data-rating', '4');
    expect(panel).toHaveAttribute('data-rating-target', 'movie-row-1');
    expect(panel).toHaveAttribute('data-notes', '1');
  });

  it('syncs the selected tab to ?tab=reviews', () => {
    render(<MediaCommentTabs mediaType="movie" tmdbId={550} viewer={viewer} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Public Reviews' }));

    expect(push).toHaveBeenCalledWith('/library/movie/550?tab=reviews', { scroll: false });
  });

  it('restores the reviews tab from the URL', () => {
    currentParams = new URLSearchParams('tab=reviews');

    render(<MediaCommentTabs mediaType="movie" tmdbId={550} viewer={viewer} />);

    expect(screen.getByRole('tab', { name: 'Public Reviews' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('reviews-panel')).toHaveAttribute('data-active', 'true');
  });

  it('supports arrow-key navigation across the tablist', () => {
    render(<MediaCommentTabs mediaType="movie" tmdbId={550} viewer={viewer} />);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Personal Notes' }), {
      key: 'ArrowRight',
    });

    expect(push).toHaveBeenCalledWith('/library/movie/550?tab=reviews', { scroll: false });
  });

  it('removes the query string when returning to Personal Notes', () => {
    currentParams = new URLSearchParams('tab=reviews');

    render(<MediaCommentTabs mediaType="movie" tmdbId={550} viewer={viewer} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Personal Notes' }));

    expect(push).toHaveBeenCalledWith('/library/movie/550', { scroll: false });
  });
});
