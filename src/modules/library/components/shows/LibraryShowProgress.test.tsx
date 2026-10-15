import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LibraryShowProgress, STATUS_HEADLINES } from './LibraryShowProgress';

const season = (seasonNumber: number, watched: boolean[]) =>
  ({
    seasonNumber,
    episodes: watched.map((w, i) => ({
      episodeNumber: i + 1,
      tracking: w ? { watched: true } : null,
    })),
  }) as never;

describe('LibraryShowProgress', () => {
  it('shows the next episode and per-season segments for a continuing show', () => {
    const { container } = render(
      <LibraryShowProgress
        seasons={[season(1, [true, true]), season(2, [true, false])]}
        numberOfEpisodes={4}
        lifecycle="continuing"
      />,
    );

    expect(screen.getByText('Next up · S2 E2')).toBeInTheDocument();
    expect(screen.getByText('75%')).toHaveClass('text-indigo-400');
    const segments = container.querySelectorAll('[role="progressbar"] > div');
    expect(segments).toHaveLength(2);
    expect(segments[0].firstChild).toHaveClass('bg-indigo-400');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Next up · S2 E2, 75 percent, show is continuing',
    );
  });

  it('shows Sweet finale 🏁 with indigo segments for a finished ended show', () => {
    const { container } = render(
      <LibraryShowProgress
        seasons={[season(1, [true, true])]}
        numberOfEpisodes={2}
        lifecycle="ended"
      />,
    );

    expect(screen.getByText('Sweet finale 🏁')).toBeInTheDocument();
    expect(screen.getByText('100%')).toHaveClass('text-indigo-400');
    expect(container.querySelector('[role="progressbar"] > div')?.firstChild).toHaveClass(
      'bg-indigo-400',
    );
  });

  it('shows All caught up & cozy for a fully watched continuing show', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [true])]}
        numberOfEpisodes={1}
        lifecycle="continuing"
      />,
    );

    expect(screen.getByText('All caught up & cozy')).toBeInTheDocument();
  });

  it('shows a fun dropped headline with rose styling for a dropped show', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [true, false])]}
        numberOfEpisodes={2}
        lifecycle="continuing"
        trackingStatus="DROPPED"
      />,
    );

    // 50% watched → deterministic pick from the quotes array.
    const expected = STATUS_HEADLINES.DROPPED[50 % STATUS_HEADLINES.DROPPED.length];
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.getByText('50%')).toHaveClass('text-rose-500');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      `${expected}, 50 percent, show is dropped`,
    );
  });

  it('treats lowercase dropped status the same way', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [true, false])]}
        numberOfEpisodes={2}
        lifecycle="continuing"
        trackingStatus="dropped"
      />,
    );

    const expected = STATUS_HEADLINES.DROPPED[50 % STATUS_HEADLINES.DROPPED.length];
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('shows a dramatic headline for WATCHING instead of the next label', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [true, false])]}
        numberOfEpisodes={2}
        lifecycle="continuing"
        trackingStatus="WATCHING"
      />,
    );

    const expected = STATUS_HEADLINES.WATCHING[50 % STATUS_HEADLINES.WATCHING.length];
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('shows a conquered headline for COMPLETED when the show has ended', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [true, true])]}
        numberOfEpisodes={2}
        lifecycle="ended"
        trackingStatus="COMPLETED"
      />,
    );

    expect(screen.getByText('Conquered 🏆')).toBeInTheDocument();
    expect(screen.queryByText('Sweet finale 🏁')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Conquered 🏆, 100 percent, show is ended',
    );
  });

  it('shows a waiting headline for COMPLETED when the show is returning', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [true, true])]}
        numberOfEpisodes={2}
        lifecycle="continuing"
        trackingStatus="COMPLETED"
      />,
    );

    expect(screen.getByText(STATUS_HEADLINES.COMPLETED[0])).toBeInTheDocument();
  });

  it('shows a dramatic headline for PLAN_TO_WATCH', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [false, false])]}
        numberOfEpisodes={2}
        lifecycle="continuing"
        trackingStatus="PLAN_TO_WATCH"
      />,
    );

    const expected = STATUS_HEADLINES.PLAN_TO_WATCH[0];
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
