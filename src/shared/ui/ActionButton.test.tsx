import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionButton } from './ActionButton';

describe('ActionButton', () => {
  it('renders children with the idle icon', () => {
    render(
      <ActionButton icon={<span>icon</span>} aria-label="Do thing">
        <span>Go</span>
      </ActionButton>,
    );

    expect(screen.getByRole('button', { name: 'Do thing' })).toHaveTextContent('Go');
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('swaps in a spinner and disables while pending', () => {
    render(
      <ActionButton isPending icon={<span>icon</span>} aria-label="Do thing">
        <span>Go</span>
      </ActionButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('.animate-spin')).not.toBeNull();
  });

  it('supports a custom pending indicator', () => {
    render(
      <ActionButton isPending pendingIcon={<span>waiting</span>} aria-label="Do thing">
        <span>Go</span>
      </ActionButton>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('waiting');
  });
});
