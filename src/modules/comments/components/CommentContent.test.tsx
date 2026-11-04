import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommentContent } from '@/modules/comments/components/CommentContent';

describe('CommentContent', () => {
  it('renders mentions as chips and keeps the surrounding text', () => {
    render(<CommentContent content="Loved it @AliKouhfar — what about you?" />);

    const chip = screen.getByText('@AliKouhfar');
    expect(chip.getAttribute('data-mention')).toBe('alikouhfar');
    expect(chip.className).toContain('rounded-full');
    expect(chip.className).toContain('bg-violet-500/15');
    expect(screen.getByText(/Loved it/)).toBeTruthy();
  });

  it('renders plain comments without chips', () => {
    const { container } = render(<CommentContent content="No mentions here." />);

    expect(container.querySelector('[data-mention]')).toBeNull();
    expect(container.textContent).toBe('No mentions here.');
  });

  it('never interprets markup in comment text as HTML', () => {
    const { container } = render(
      <CommentContent content={'<img src=x onerror=alert(1)> @handle'} />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});
