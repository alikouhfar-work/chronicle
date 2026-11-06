'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  ActiveMention,
  MentionComposerTextareaProps,
  MentionSearchPayload as SearchPayload,
} from '@/modules/comments/types/mentionComposerTextarea';
import type { PublicUser } from '@/modules/user/types';

const mentionAtCaret = (value: string, caret: number): ActiveMention | null => {
  const beforeCaret = value.slice(0, caret);
  const match = beforeCaret.match(/(^|[^\w@])@([a-z0-9_]{0,32})$/i);
  if (!match) return null;

  const start = caret - match[0].length + (match[1]?.length ?? 0);
  return { start, end: caret, query: match[2] ?? '' };
};

export const MentionComposerTextarea = ({
  value,
  onChange,
  mentionIds,
  onMentionIdsChange,
  disabled,
  placeholder,
  maxLength,
  invalid,
}: MentionComposerTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeQuery = activeMention?.query;

  useEffect(() => {
    if (activeQuery === undefined || activeQuery.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(activeQuery)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as SearchPayload;
        if (!response.ok) throw new Error('User search failed.');
        setUsers(Array.isArray(payload.users) ? payload.users : []);
        setActiveIndex(0);
      } catch {
        if (!controller.signal.aborted) setUsers([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [activeQuery]);

  const selectUser = (user: PublicUser) => {
    if (!activeMention) return;
    const inserted = `@${user.username} `;
    onChange(
      `${value.slice(0, activeMention.start)}${inserted}${value.slice(activeMention.end)}`,
    );
    onMentionIdsChange(new Set([...mentionIds, user.id]));
    setActiveMention(null);
    setUsers([]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.currentTarget.value;
    onChange(nextValue);
    const mention = mentionAtCaret(nextValue, event.currentTarget.selectionStart);
    setActiveMention(mention);
    if (!mention || mention.query.length < 2) {
      setUsers([]);
      setLoading(false);
      setActiveIndex(0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeMention) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setActiveMention(null);
      return;
    }

    if (users.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % users.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + users.length) % users.length);
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const active = users[activeIndex];
      if (active) selectUser(active);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={3}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label="Write a review"
        role="combobox"
        aria-invalid={invalid ? true : undefined}
        aria-autocomplete="list"
        aria-controls="mention-suggestions"
        aria-expanded={activeMention !== null}
        aria-activedescendant={users.length ? `mention-option-${activeIndex}` : undefined}
        className="w-full resize-y rounded-2xl border border-white/10 bg-white/4 p-3 text-base leading-relaxed text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-400/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
      />
      <input type="hidden" name="mentionIds" value={JSON.stringify([...mentionIds])} readOnly />

      {activeMention && (
        <div
          id="mention-suggestions"
          role="listbox"
          aria-label="Mention suggestions"
          className="absolute top-full left-0 z-30 mt-2 max-h-56 w-full max-w-sm overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          {activeMention.query.length < 2 ? (
            <p className="px-3 py-2 text-xs text-zinc-400">Type at least 2 characters to search.</p>
          ) : loading ? (
            <p className="px-3 py-2 text-xs text-zinc-400" role="status">Searching users…</p>
          ) : users.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-400">No users found.</p>
          ) : (
            users.map((user, index) => (
              <button
                id={`mention-option-${index}`}
                key={user.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectUser(user)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-white/10 focus:bg-white/10 focus:outline-none"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <span className="size-7 rounded-full bg-violet-500/20" aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-white">
                    {user.name || user.username}
                  </span>
                  <span className="block truncate text-[11px] text-zinc-400">@{user.username}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
