import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const setMediaRating = vi.fn();

vi.mock('@/modules/media/actions/setMediaRating', () => ({
  setMediaRating: (...args: unknown[]) => setMediaRating(...args),
}));

vi.mock('react-hot-toast', () => ({
  default: { custom: vi.fn(() => 'toast-1'), dismiss: vi.fn() },
}));

import { RatingControl } from './RatingControl';

const rate = async (star: number) => {
  await act(async () => {
    fireEvent.click(screen.getByLabelText(`Rate ${star} of 5`));
  });
};

describe('RatingControl', () => {
  beforeEach(() => {
    setMediaRating.mockReset();
    setMediaRating.mockResolvedValue({ success: true });
  });

  it('writes the rating through setMediaRating in the panel variant', async () => {
    render(
      <RatingControl mediaType="movie" targetId="movie-1" value={null} label="Your rating" />,
    );

    expect(screen.getByText('Not rated')).toBeTruthy();
    expect(screen.getByText(/Rate this movie on its own — notes stay independent/)).toBeTruthy();

    await rate(4);

    expect(setMediaRating).toHaveBeenCalledWith({
      mediaType: 'movie',
      id: 'movie-1',
      rating: 4,
    });
    await waitFor(() => expect(screen.getByText('4 / 5')).toBeTruthy());
  });

  it('clears the rating when the current star is clicked again', async () => {
    render(<RatingControl mediaType="episode" targetId="episode-1" value={3} label="Your rating" />);

    expect(screen.getByText('3 / 5')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Clear rating (3 of 5)'));
    });

    expect(setMediaRating).toHaveBeenCalledWith({
      mediaType: 'episode',
      id: 'episode-1',
      rating: null,
    });
  });

  it('labels the compact header variant without the panel copy', () => {
    render(
      <RatingControl
        mediaType="movie"
        targetId="movie-1"
        value={2}
        label="Rate this movie"
        variant="compact"
      />,
    );

    expect(screen.getByRole('group', { name: 'Rate this movie' })).toBeTruthy();
    expect(screen.getByText('2 / 5')).toBeTruthy();
    expect(screen.queryByText(/notes stay independent/)).toBeNull();
  });

  it('adopts a rating written from the other control once the prop changes', () => {
    const { rerender } = render(
      <RatingControl mediaType="movie" targetId="movie-1" value={null} label="Your rating" />,
    );

    expect(screen.getByText('Not rated')).toBeTruthy();

    rerender(<RatingControl mediaType="movie" targetId="movie-1" value={5} label="Your rating" />);

    expect(screen.getByText('5 / 5')).toBeTruthy();
  });

  it('reverts and reports a failed write', async () => {
    setMediaRating.mockResolvedValue({ success: false, error: 'Nope' });

    render(<RatingControl mediaType="movie" targetId="movie-1" value={1} label="Your rating" />);

    await rate(5);

    await waitFor(() => expect(screen.getByText('1 / 5')).toBeTruthy());
    expect(screen.getByLabelText('Rate 5 of 5')).toBeTruthy();
  });
});
