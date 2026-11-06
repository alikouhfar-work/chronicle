'use client';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { RewatchButton } from './RewatchButton';

const addRewatch = vi.fn();
const unwatchMedia = vi.fn();
const undoUnwatch = vi.fn();

vi.mock('@/modules/rewatch/actions/addRewatch', () => ({
  addRewatch: (...args: unknown[]) => addRewatch(...args),
}));

vi.mock('@/modules/rewatch/actions/unwatchMedia', () => ({
  unwatchMedia: (...args: unknown[]) => unwatchMedia(...args),
}));

vi.mock('@/modules/rewatch/actions/undoUnwatch', () => ({
  undoUnwatch: (...args: unknown[]) => undoUnwatch(...args),
}));

vi.mock('@/modules/rewatch/actions/loadRewatchHistory', () => ({
  loadRewatchHistory: vi.fn(),
}));

vi.mock('@/modules/rewatch/actions/removeRewatch', () => ({
  removeRewatch: vi.fn(),
}));

vi.mock('@/modules/rewatch/actions/updateRewatchLog', () => ({
  updateRewatchLog: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('react-hot-toast', () => ({
  default: { custom: vi.fn(), dismiss: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  addRewatch.mockReset();
  unwatchMedia.mockReset();
  undoUnwatch.mockReset();
  // jsdom has no modal dialog implementation.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});


const renderButton = (props: Partial<React.ComponentProps<typeof RewatchButton>> = {}) =>
  render(
    <RewatchButton
      mediaType="movie"
      mediaId="movie-1"
      initialCount={0}
      historyTitle="Fight Club"
      {...props}
    />,
  );

describe('RewatchButton', () => {
  it('logs the first watch directly when nothing has been watched yet', async () => {
    addRewatch.mockResolvedValue({ success: true, rewatchCount: 1 });

    renderButton();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Log a watch.' }));
    });

    await waitFor(() => expect(addRewatch).toHaveBeenCalledWith('movie', 'movie-1'));
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('asks before logging another watch once the movie has been watched', async () => {
    renderButton({ initialCount: 2 });

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Watch options. 2 watches logged.' }),
      );
    });

    expect(addRewatch).not.toHaveBeenCalled();
    // The dialog is a dynamic() import now, so it lands a tick later.
    await waitFor(() => expect(document.querySelector('dialog')).not.toBeNull());
    const dialog = document.querySelector('dialog');
    expect(dialog?.textContent).toContain('Movie Options');
    expect(dialog?.textContent).toContain('Fight Club');
    expect(dialog?.textContent).toContain('2 watches logged');
  });

  it('opens the same dialog for shows and seasons', async () => {
    renderButton({ mediaType: 'show', initialCount: 1, historyTitle: 'Severance' });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Watch options. 1 watch logged.' }));
    });
    await waitFor(() =>
      expect(document.querySelector('dialog')?.textContent).toContain('Show Options'),
    );
  });

  it('asks before logging when a movie is completed but has no logged watches', async () => {
    renderButton({ initialCount: 0, watched: true });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Watch options. 1 watch logged.' }));
    });

    expect(addRewatch).not.toHaveBeenCalled();
    const dialog = document.querySelector('dialog');
    expect(dialog?.textContent).toContain('Movie Options');
    expect(dialog?.textContent).toContain('1 watch logged');
  });

  it('unwatches through the dialog and resets the count', async () => {
    unwatchMedia.mockResolvedValue({
      success: true,
      rewatchCount: 0,
      removedLogs: 3,
      undoToken: 'removal-1',
    });

    renderButton({ initialCount: 3 });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Watch options. 3 watches logged.' }),
      );
    });

    const unwatch = [...document.querySelectorAll('dialog button')].find((button) =>
      button.textContent?.startsWith('Unwatch'),
    );
    await act(async () => {
      fireEvent.click(unwatch!);
    });

    await waitFor(() => expect(unwatchMedia).toHaveBeenCalledWith('movie', 'movie-1'));
    await waitFor(() => expect(screen.getByText('Watch (0)')).toBeTruthy());
  });

  it('logs a rewatch through the dialog', async () => {
    addRewatch.mockResolvedValue({ success: true, rewatchCount: 3 });

    renderButton({ initialCount: 2 });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Watch options. 2 watches logged.' }),
      );
    });

    const rewatch = [...document.querySelectorAll('dialog button')].find((button) =>
      button.textContent?.startsWith('Rewatch'),
    );
    await act(async () => {
      fireEvent.click(rewatch!);
    });

    await waitFor(() =>
      expect(addRewatch).toHaveBeenCalledWith('movie', 'movie-1', undefined, expect.any(String)),
    );
    await waitFor(() => expect(screen.getByText('Watch (3)')).toBeTruthy());
  });

  it('offers an undo in the unwatch toast and restores the count through it', async () => {
    unwatchMedia.mockResolvedValue({
      success: true,
      rewatchCount: 0,
      removedLogs: 3,
      undoToken: 'removal-1',
    });
    undoUnwatch.mockResolvedValue({
      success: true,
      rewatchCount: 3,
      mediaType: 'movie',
      mediaId: 'movie-1',
    });

    renderButton({ initialCount: 3 });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Watch options. 3 watches logged.' }));
    });

    const unwatch = [...document.querySelectorAll('dialog button')].find((button) =>
      button.textContent?.startsWith('Unwatch'),
    );
    await act(async () => {
      fireEvent.click(unwatch!);
    });

    await waitFor(() => expect(screen.getByText('Watch (0)')).toBeTruthy());

    // The undo lives in the toast's action, rendered by `toast.custom`.
    const renderToast = vi.mocked(toast.custom).mock.calls.at(-1)![0] as (toast: {
      id: string;
    }) => React.ReactElement<{ action?: { label: string; onClick: () => void } }>;
    const action = renderToast({ id: 'toast-1' }).props.action;

    expect(action?.label).toBe('Undo');

    await act(async () => {
      action!.onClick();
    });

    await waitFor(() => expect(undoUnwatch).toHaveBeenCalledWith('removal-1'));
    await waitFor(() => expect(screen.getByText('Watch (3)')).toBeTruthy());
  });
});
