import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconBell } from '@tabler/icons-react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title, description, and icon', () => {
    render(
      <EmptyState icon={IconBell} title="Nothing here" description="Add something to get started." />,
    );

    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Add something to get started.')).toBeTruthy();
    expect(document.querySelector('svg')).not.toBeNull();
  });

  it('renders an optional action', () => {
    render(
      <EmptyState
        icon={IconBell}
        title="No results"
        action={<a href="/external-example">Clear search</a>}
      />,
    );

    expect(screen.getByRole('link', { name: 'Clear search' })).toBeTruthy();
  });

  it('uses the compact spacing inside popovers', () => {
    const { container } = render(<EmptyState icon={IconBell} title="Empty" compact />);
    const card = container.firstElementChild as HTMLElement;

    expect(card.className).toContain('py-8');
    expect(card.className).not.toContain('py-12');
  });

  it('keeps the description optional', () => {
    render(<EmptyState icon={IconBell} title="Only a title" />);

    // Only the title paragraph is rendered.
    expect(screen.getAllByRole('paragraph')).toHaveLength(1);
  });
});
