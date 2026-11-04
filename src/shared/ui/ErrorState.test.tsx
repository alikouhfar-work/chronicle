import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('shows product copy, a retry, and a way back', () => {
    render(<ErrorState onRetry={vi.fn()} />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('button', { name: /try again/i }).id).toBe('error-try-again-btn');
    expect(screen.getByRole('link', { name: /back to library/i }).getAttribute('href')).toBe(
      '/library',
    );
  });

  it('never exposes a stack trace, only the digest', () => {
    render(<ErrorState digest="abc123" />);

    expect(screen.getByText('Reference: abc123')).toBeTruthy();
    expect(screen.queryByText(/at .*\(.*:\d+:\d+\)/)).toBeNull();
  });

  it('calls onRetry when the user retries', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button when no handler is given', () => {
    render(<ErrorState backHref="/" backLabel="Go home" />);

    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
    expect(screen.getByRole('link', { name: 'Go home' }).getAttribute('href')).toBe('/');
  });

  it('accepts page-specific copy', () => {
    render(<ErrorState title="This title could not be loaded" description="Try again shortly." />);

    expect(screen.getByText('This title could not be loaded')).toBeTruthy();
    expect(screen.getByText('Try again shortly.')).toBeTruthy();
  });
});
