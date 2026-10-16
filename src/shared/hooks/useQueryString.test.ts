import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryString } from './useQueryString';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const replace = vi.fn();

describe('useQueryString', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue('/library');
    vi.mocked(useRouter).mockReturnValue({ replace } as never);
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('type=tv&status=all') as never,
    );
  });

  it('merges a single param into the current query string', () => {
    const { result } = renderHook(() => useQueryString());

    act(() => {
      result.current.createQueryString('status', 'completed');
    });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/library?type=tv&status=completed');
  });

  it('supports object updates and deletes empty values', () => {
    const { result } = renderHook(() => useQueryString());

    act(() => {
      result.current.createQueryString({ search: '', sort: 'title' });
    });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/library?type=tv&status=all&sort=title');
  });

  it('skips navigation when the query string is unchanged', () => {
    const { result } = renderHook(() => useQueryString());

    act(() => {
      result.current.createQueryString('status', 'all');
    });

    expect(replace).not.toHaveBeenCalled();
  });
});
