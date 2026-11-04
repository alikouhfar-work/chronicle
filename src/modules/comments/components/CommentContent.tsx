import { Fragment } from 'react';
import { tokenizeMentions } from '@/modules/comments/lib/tokenizeMentions';
import type { CommentContentProps } from '@/modules/comments/types/commentContent';

const DEFAULT_CLASS_NAME =
  'text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-200';

/**
 * Renders comment text with `@handles` as chips. Text is always rendered as
 * text nodes (never raw HTML), so mentions can't inject markup.
 */
export const CommentContent = ({ content, className }: CommentContentProps) => {
  const segments = tokenizeMentions(content);

  return (
    <p className={className ?? DEFAULT_CLASS_NAME}>
      {segments.map((segment, index) =>
        segment.type === 'mention' ? (
          <span
            key={index}
            data-mention={segment.handle}
            className="mx-px inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/15 px-1.5 py-px align-baseline text-[13px] font-semibold whitespace-nowrap text-violet-200"
          >
            {segment.raw}
          </span>
        ) : (
          <Fragment key={index}>{segment.value}</Fragment>
        ),
      )}
    </p>
  );
};
