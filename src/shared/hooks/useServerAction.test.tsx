import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useServerAction } from './useServerAction';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const refresh = vi.fn();

describe('useServerAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ refresh } as never);
  });

  it('toasts success and refreshes on resolve', async () => {
    const received: string[] = [];
    const action = vi.fn(async (arg: string) => {
      received.push(arg);
    });
    const { result } = renderHook(() =>
      useServerAction(action, { successMessage: 'Done!' }),
    );

    expect(result.current.isPending).toBe(false);

    await act(async () => {
      result.current.execute('arg');
    });

    expect(action).toHaveBeenCalledWith('arg');
    expect(received).toEqual(['arg']);
    expect(toast.success).toHaveBeenCalledWith('Done!');
    expect(refresh).toHaveBeenCalled();
  });

  it('toasts union failures without refreshing', async () => {
    const action = vi.fn(async () => ({ success: false, error: 'Nope.' }));
    const { result } = renderHook(() =>
      useServerAction(action, { errorMessage: 'Fallback.' }),
    );

    await act(async () => {
      result.current.execute();
    });

    expect(toast.error).toHaveBeenCalledWith('Nope.');
    expect(refresh).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('toasts thrown errors with the fallback message', async () => {
    const action = vi.fn(async () => {
      throw new Error('Kaboom');
    });
    const { result } = renderHook(() =>
      useServerAction(action, { errorMessage: 'Fallback.' }),
    );

    await act(async () => {
      result.current.execute();
    });

    expect(toast.error).toHaveBeenCalledWith('Kaboom');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('skips refresh when disabled', async () => {
    const action = vi.fn(async () => undefined);
    const { result } = renderHook(() => useServerAction(action, { refresh: false }));

    await act(async () => {
      result.current.execute();
    });

    expect(refresh).not.toHaveBeenCalled();
  });
});
