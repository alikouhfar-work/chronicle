import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MentionComposerTextarea } from '@/modules/comments/components/MentionComposerTextarea';

const user = { id: 'user-1', username: 'alice', name: 'Alice Adams', image: null };

describe('MentionComposerTextarea', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('opens on @, inserts the selected handle, and records its id in a hidden field', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ users: [user] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const onChange = vi.fn();
    const onMentionIdsChange = vi.fn();
    const { rerender } = render(
      <MentionComposerTextarea
        value="Hello "
        onChange={onChange}
        mentionIds={new Set()}
        onMentionIdsChange={onMentionIdsChange}
        disabled={false}
      />,
    );
    const textarea = screen.getByRole('combobox', { name: 'Write a review' }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello @al' } });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/users/search?q=al', expect.any(Object)));
    await screen.findByRole('option', { name: /alice.*@alice/i });
    fireEvent.click(screen.getByRole('option', { name: /alice.*@alice/i }));

    expect(onChange).toHaveBeenLastCalledWith('Hello @alice ');
    expect(onMentionIdsChange).toHaveBeenCalledWith(new Set(['user-1']));

    rerender(
      <MentionComposerTextarea
        value="Hello @alice "
        onChange={onChange}
        mentionIds={new Set(['user-1'])}
        onMentionIdsChange={onMentionIdsChange}
        disabled={false}
      />,
    );
    expect(document.querySelector('input[name="mentionIds"]')).toHaveValue('["user-1"]');
  });

  it('does not offer mentions for an email address', () => {
    render(
      <MentionComposerTextarea
        value="me@example.com"
        onChange={vi.fn()}
        mentionIds={new Set()}
        onMentionIdsChange={vi.fn()}
        disabled={false}
      />,
    );

    const textarea = screen.getByRole('combobox', { name: 'Write a review' });
    fireEvent.change(textarea, {
      target: { value: 'me@example.com', selectionStart: 'me@example.com'.length },
    });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
