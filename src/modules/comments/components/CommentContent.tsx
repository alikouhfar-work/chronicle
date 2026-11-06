import { Fragment } from 'react';
import { tokenizeMentions } from '@/modules/comments/lib/tokenizeMentions';
import type { CommentContentProps } from '@/modules/comments/types/commentContent';

const DEFAULT_CLASS_NAME =
  'text-sm leading-relaxed break-words whitespace-pre-wrap text-ink-secondary';

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
            className="mx-px inline-flex items-center rounded-pill border border-accent-ink bg-accent-bright/15 px-1.5 py-px align-baseline text-xs font-semibold whitespace-nowrap text-accent-tint"
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
