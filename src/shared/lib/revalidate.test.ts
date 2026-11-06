import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

import { revalidateLibrary, revalidateMediaDetail } from '@/shared/lib/revalidate';

describe('revalidate helpers', () => {
  beforeEach(() => {
    // reset, not clear: the previous test replaces the implementations with
    // throwing ones and clearAllMocks would keep them.
    mocks.revalidatePath.mockReset();
    mocks.revalidateTag.mockReset();
  });

  it('invalidates the media tag, the catch-all pattern and the concrete path', () => {
    revalidateMediaDetail('movie', 550);

    expect(mocks.revalidateTag).toHaveBeenCalledWith('media', 'max');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/library/[...slug]', 'page');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/library/movie/550', 'page');
  });

  it('also refreshes the library lists', () => {
    revalidateMediaDetail('tv', 95396);

    const paths = mocks.revalidatePath.mock.calls.map((call) => call[0]);
    expect(paths).toContain('/');
    expect(paths).toContain('/library');
  });

  it('never throws when no cache store exists', () => {
    // Unit tests and scripts run outside Next; a failed invalidation must not
    // fail the write that triggered it.
    mocks.revalidateTag.mockImplementation(() => {
      throw new Error('static generation store missing');
    });
    mocks.revalidatePath.mockImplementation(() => {
      throw new Error('static generation store missing');
    });

    expect(() => revalidateMediaDetail('movie', 550)).not.toThrow();
    expect(() => revalidateLibrary()).not.toThrow();
  });

  it('library invalidation touches only the two lists', () => {
    revalidateLibrary();

    expect(mocks.revalidatePath.mock.calls.map((call) => call[0])).toEqual(['/', '/library']);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});
