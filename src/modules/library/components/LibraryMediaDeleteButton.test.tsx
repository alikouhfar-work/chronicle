import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { LibraryMediaDeleteButton } from './LibraryMediaDeleteButton';

vi.mock('@/modules/show/actions/deleteShowFromLibrary', () => ({
  deleteShowFromLibrary: vi.fn(),
}));

vi.mock('@/modules/movie/actions/deleteMovieFromLibrary', () => ({
  deleteMovieFromLibrary: vi.fn(),
}));

vi.mock('@/shared/hooks/useServerAction', () => ({
  useServerAction: vi.fn(),
}));

// Mimics Next <Link>: a real anchor whose React onClick navigates. Portal
// clicks bubble through the React tree, so without stopPropagation the
// backdrop click reaches this handler just like the real card link.
const linkNavigate = vi.fn();
vi.mock('next/link', () => ({
  default: ({ children }: { children: ReactNode }) => (
    // Deliberate plain anchor: mimics the card link's navigation handler.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a href="/library/tv/1" onClick={() => linkNavigate()}>
      {children}
    </a>
  ),
}));

const execute = vi.fn();

describe('LibraryMediaDeleteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(useServerAction).mockReturnValue({ execute, isPending: false } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = '';
  });

  const openDialog = () => {
    const { container } = render(
      <div>
        <LibraryMediaDeleteButton mediaId="show-1" mediaType="tv" />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove from library' }));
    return container;
  };

  it('keeps the dialog closed until the trigger is pressed', () => {
    render(<LibraryMediaDeleteButton mediaId="show-1" mediaType="tv" />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('portals the overlay to document.body with viewport positioning', () => {
    const container = openDialog();

    const dialog = screen.getByRole('alertdialog');
    // Portaled out of the card link: positioned against the viewport, above
    // sticky chrome — never trapped by card transforms or overflow.
    expect(dialog.parentElement).toBe(document.body);
    expect(container.contains(dialog)).toBe(false);
    expect(dialog).toHaveClass('fixed', 'inset-0', 'z-[100]');
    expect(screen.getByText('Remove from library?')).toBeInTheDocument();
  });

  it('focuses cancel on open and locks background scroll', () => {
    openDialog();

    expect(document.activeElement?.textContent).toBe('Cancel');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes on cancel with a fade-out, restoring scroll', () => {
    openDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('alertdialog')).toHaveClass('animate-fade-out');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(execute).not.toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    openDialog();

    fireEvent.click(screen.getByRole('alertdialog'));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', () => {
    openDialog();

    fireEvent.keyDown(document, { key: 'Escape' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('deletes on confirm and closes', () => {
    openDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith('show-1');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('never navigates the parent card link from backdrop, cancel, or delete', async () => {
    const Link = (await import('next/link')).default;
    render(
      <Link href="/library/tv/1">
        <LibraryMediaDeleteButton mediaId="show-1" mediaType="tv" />
      </Link>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove from library' }));
    expect(linkNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('alertdialog'));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(linkNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Remove from library' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(linkNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Remove from library' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(linkNavigate).not.toHaveBeenCalled();
  });
});
