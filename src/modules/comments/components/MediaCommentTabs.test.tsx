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

vi.mock('@/modules/comments/components/PersonalNotesPanel', () => ({
  PersonalNotesPanel: ({ mediaType }: { mediaType: string }) => (
    <div data-testid="personal-panel">Personal {mediaType}</div>
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
