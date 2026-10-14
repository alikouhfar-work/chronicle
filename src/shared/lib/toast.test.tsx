import { describe, expect, it, vi, beforeEach } from 'vitest';
import toast from 'react-hot-toast';
import { toastError, toastInfo, toastSuccess } from './toast';

vi.mock('react-hot-toast', () => ({
  default: {
    custom: vi.fn(() => 'toast-1'),
    dismiss: vi.fn(),
  },
}));

const lastToastProps = () => {
  const render = vi.mocked(toast.custom).mock.calls[0][0] as (t: { id: string }) => React.ReactElement;
  return render({ id: 'toast-1' }).props as {
    id: string;
    tone: string;
    title: string;
    message?: string;
  };
};

describe('app toast helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes success with default title', () => {
    expect(toastSuccess('Link copied to clipboard')).toBe('toast-1');
    expect(lastToastProps()).toMatchObject({
      tone: 'success',
      title: 'Done',
      message: 'Link copied to clipboard',
    });
  });

  it('routes info with custom title', () => {
    toastInfo('Shared natively', 'Shared');
    expect(lastToastProps()).toMatchObject({ tone: 'info', title: 'Shared' });
  });

  it('routes errors with extracted message', () => {
    toastError(new Error('Kaboom'));
    expect(lastToastProps()).toMatchObject({
      tone: 'error',
      title: 'Something went wrong',
      message: 'Kaboom',
    });
  });
});
