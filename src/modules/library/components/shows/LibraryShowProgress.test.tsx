import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LibraryShowProgress } from './LibraryShowProgress';

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

    expect(screen.getByText('S2 E2')).toBeInTheDocument();
    expect(screen.getByText('75%')).toHaveClass('text-indigo-400');
    const segments = container.querySelectorAll('[role="progressbar"] > div');
    expect(segments).toHaveLength(2);
    expect(segments[0].firstChild).toHaveClass('bg-indigo-400');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'S2 E2, 75 percent, show is continuing',
    );
  });

  it('shows Ended with indigo segments for a finished ended show', () => {
    const { container } = render(
      <LibraryShowProgress
        seasons={[season(1, [true, true])]}
        numberOfEpisodes={2}
        lifecycle="ended"
      />,
    );

    expect(screen.getByText('Ended')).toBeInTheDocument();
    expect(screen.getByText('100%')).toHaveClass('text-indigo-400');
    expect(container.querySelector('[role="progressbar"] > div')?.firstChild).toHaveClass(
      'bg-indigo-400',
    );
  });

  it('shows Caught up for a fully watched continuing show', () => {
    render(
      <LibraryShowProgress
        seasons={[season(1, [true])]}
        numberOfEpisodes={1}
        lifecycle="continuing"
      />,
    );

    expect(screen.getByText('Caught up')).toBeInTheDocument();
  });
});
