'use client';

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import toast from 'react-hot-toast';
import { LibraryDetailsShareButton } from './LibraryDetailsShareButton';

vi.mock('react-hot-toast', () => ({
  default: { custom: vi.fn(), dismiss: vi.fn() },
}));

const media = {
  name: 'Severance',
  tmdbId: 123,
  tagline: 'Clock in.',
  overview: 'A workplace thriller.',
  genres: [{ id: '1', name: 'Drama' }],
  firstAirDate: new Date('2022-02-18T00:00:00Z'),
  lastAirDate: null,
  posterPath: '/poster.jpg',
  seasons: [],
  tracking: null,
} as never;

const credits = {
  cast: [{ id: 1, name: 'Adam Scott', order: 0, character: 'Mark Scout', profilePath: '' }],
  crew: [],
} as never;

describe('LibraryDetailsShareButton', () => {
  const writeText = vi.fn(async (_text: string) => { void _text; });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p');
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    // No network in tests — poster attach falls back to the poster URL in text.
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('copies the full message without a toast when native share is unavailable', async () => {
    render(<LibraryDetailsShareButton media={media} mediaType="tv" credits={credits} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share Severance' }));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    // Not just the link: the clipboard message carries the headline, genres,
    // cast, details URL, and poster so a paste still reads as a share.
    const message = writeText.mock.calls[0]?.[0] as unknown as string;
    expect(message.startsWith('Severance (2022)\nGenres: Drama')).toBe(true);
    expect(message).toContain('Cast: Adam Scott as Mark Scout');
    expect(message).toContain(`${window.location.origin}/search?query=Severance`);
    expect(message.endsWith('https://image.tmdb.org/t/p/w500/poster.jpg')).toBe(true);
    expect(toast.custom).not.toHaveBeenCalled();
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('shares the full message natively', async () => {
    const share = vi.fn(async () => {});
    vi.stubGlobal('navigator', {
      ...window.navigator,
      clipboard: { writeText },
      share,
      canShare: () => false,
    });

    render(<LibraryDetailsShareButton media={media} mediaType="tv" credits={credits} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share Severance' }));
    });

    expect(share).toHaveBeenCalledTimes(1);
    const calls = share.mock.calls as unknown as Array<
      [{ title: string; text: string; url: string }]
    >;
    const payload = calls[0][0];
    expect(payload.title).toBe('Severance (2022)');
    expect(payload.url).toBe(`${window.location.origin}/search?query=Severance`);
    expect(payload.text.startsWith('Severance (2022)\nGenres: Drama')).toBe(true);
    expect(payload.text).toContain('Genres: Drama');
    expect(payload.text).toContain('Cast: Adam Scott as Mark Scout');
    expect(payload.text).toContain('A workplace thriller.');
    expect(payload.text).toContain('https://image.tmdb.org/t/p/w500/poster.jpg');
    expect(payload.text).toContain(`${window.location.origin}/search?query=Severance`);
    expect(toast.custom).not.toHaveBeenCalled();
  });

  it('stays silent when the native sheet is dismissed', async () => {
    const abort = new DOMException('Dismissed', 'AbortError');
    vi.stubGlobal('navigator', {
      ...window.navigator,
      clipboard: { writeText },
      share: vi.fn(async () => {
        throw abort;
      }),
    });

    render(<LibraryDetailsShareButton media={media} mediaType="tv" credits={credits} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share Severance' }));
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(toast.custom).not.toHaveBeenCalled();
  });

  it('toasts only when sharing fails', async () => {
    vi.stubGlobal('navigator', {
      ...window.navigator,
      clipboard: { writeText: vi.fn(async () => { throw new Error('denied'); }) },
    });

    render(<LibraryDetailsShareButton media={media} mediaType="tv" credits={credits} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share Severance' }));
    });

    expect(toast.custom).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });

  it('shares serialized media where Dates arrive as ISO strings', async () => {
    // Regression: media crosses the RSC boundary into this client component,
    // so Date fields are strings at runtime. Sharing must not crash.
    const serialized = {
      name: 'Severance',
      tmdbId: 123,
      tagline: 'Clock in.',
      overview: 'A workplace thriller.',
      genres: [{ id: '1', name: 'Drama' }],
      firstAirDate: '2022-02-18T00:00:00.000Z',
      lastAirDate: null,
      posterPath: '/poster.jpg',
      seasons: [],
      tracking: null,
    } as never;
    const share = vi.fn(async () => {});
    vi.stubGlobal('navigator', {
      ...window.navigator,
      clipboard: { writeText },
      share,
      canShare: () => false,
    });

    render(<LibraryDetailsShareButton media={serialized} mediaType="tv" credits={credits} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share Severance' }));
    });

    expect(share).toHaveBeenCalledTimes(1);
    const calls = share.mock.calls as unknown as Array<
      [{ title: string; text: string; url: string }]
    >;
    expect(calls[0][0].title).toBe('Severance (2022)');
    expect(calls[0][0].text.startsWith('Severance (2022)')).toBe(true);
    expect(toast.custom).not.toHaveBeenCalled();
  });

  it('prefers the public app URL for the details link when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://chronicle.example');

    render(<LibraryDetailsShareButton media={media} mediaType="tv" credits={credits} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share Severance' }));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const message = writeText.mock.calls[0]?.[0] as unknown as string;
    expect(message).toContain('https://chronicle.example/search?query=Severance');
    expect(message).not.toContain(window.location.origin);
  });
});
