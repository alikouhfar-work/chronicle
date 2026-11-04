'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import {
  IconAlertCircle,
  IconLoader2,
  IconLock,
  IconMessage,
  IconPhoto,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { createComment } from '@/modules/comments/actions/createComment';
import { listComments } from '@/modules/comments/services/listComments';
import {
  CommentImageGrid,
} from '@/modules/comments/components/CommentImageGrid';
import type { CommentAttachment } from '@/modules/comments/types/commentAttachment';
import { MentionComposerTextarea } from '@/modules/comments/components/MentionComposerTextarea';
import { COMMENT_MAX_LENGTH, MAX_ATTACHMENTS } from '@/modules/comments/constants';
import type { FeedStatus } from '@/modules/comments/types/feedStatus';
import type {
  CommentCursor,
  CommentView,
  PendingCommentAttachment,
} from '@/modules/comments/types';
import type { PublicReviewsPanelProps } from '@/modules/comments/types/mediaCommentTabs';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { createMonogram } from '@/shared/lib/createMonogram';
import { toastError } from '@/shared/lib/toast';

const PAGE_SIZE = 20;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const relativeTime = (value: Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true });
};

const absoluteTime = (value: Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'PPpp');
};

const toGridAttachments = (comment: CommentView): CommentAttachment[] =>
  comment.attachments.map((attachment) => ({
    id: attachment.id,
    url: attachment.url,
    mimeType: attachment.mimeType,
  }));

const CommentSkeleton = () => (
  <div className="glass-card space-y-3 rounded-3xl border border-white/10 p-5">
    <div className="flex items-center gap-3">
      <div className="size-9 animate-pulse rounded-full bg-white/6 motion-reduce:animate-none" />
      <div className="space-y-1.5">
        <div className="h-3 w-28 animate-pulse rounded bg-white/8 motion-reduce:animate-none" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-white/5 motion-reduce:animate-none" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
    </div>
  </div>
);

export const PublicReviewsPanel = ({
  mediaType,
  tmdbId,
  viewer,
  active = true,
  initialReviews,
}: PublicReviewsPanelProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reducedMotion = usePrefersReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Set by notification deep links (`?mention=unavailable`) when the target
  // comment was deleted. Non-blocking: the feed stays fully usable.
  const [showUnavailableNotice, setShowUnavailableNotice] = useState(
    () => searchParams.get('mention') === 'unavailable',
  );

  // The first page arrives from the Server Component; only pagination,
  // optimistic writes, and rollback resyncs run on the client.
  const [comments, setComments] = useState<CommentView[]>(initialReviews?.comments ?? []);
  const [cursor, setCursor] = useState<CommentCursor | undefined>(initialReviews?.nextCursor);
  const [hasMore, setHasMore] = useState(Boolean(initialReviews?.hasMore));
  const [status, setStatus] = useState<FeedStatus>(initialReviews ? 'ready' : 'loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [mentionIds, setMentionIds] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<PendingCommentAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setStatus('loading');
    setFeedError(null);

    const result = await listComments(mediaType, tmdbId, undefined, PAGE_SIZE);
    if (result.success) {
      setComments(result.comments);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setStatus('ready');
    } else {
      setFeedError(result.error ?? 'Could not load reviews.');
      setStatus('error');
    }
  }, [mediaType, tmdbId]);

  useEffect(() => {
    // Skip the mount fetch when the server already rendered the first page.
    if (initialReviews) return;
    // Synchronous loading state is intentional: the skeleton must paint
    // before the server action resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInitial();
  }, [loadInitial, initialReviews]);

  // Deep-link support: `#comment-<id>` scrolls the node into view once the
  // feed has rendered. The persistent highlight itself is pure CSS (`target:`)
  // so it works without an extra state pass.
  useEffect(() => {
    if (!active || status !== 'ready') return;

    const hash = typeof window === 'undefined' ? '' : window.location.hash;
    if (!hash.startsWith('#comment-')) return;

    const element = document.getElementById(hash.slice(1));
    if (!element) return;

    element.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
  }, [active, comments.length, reducedMotion, status]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;

    setLoadingMore(true);
    const result = await listComments(mediaType, tmdbId, cursor, PAGE_SIZE);
    setLoadingMore(false);

    if (!result.success) {
      toastError(result.error, 'Couldn’t load more reviews.');
      return;
    }

    setComments((previous) => {
      const seen = new Set(previous.map((comment) => comment.id));
      return [...previous, ...result.comments.filter((comment) => !seen.has(comment.id))];
    });
    setCursor(result.nextCursor);
    setHasMore(result.hasMore);
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const files = Array.from(fileList);
    setComposerError(null);

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setComposerError(`You can attach up to ${MAX_ATTACHMENTS} images.`);
      return;
    }

    const invalidType = files.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      setComposerError('Only JPEG, PNG, and WebP images are supported.');
      return;
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      setComposerError('Each image must be 5MB or smaller.');
      return;
    }

    setUploading(true);
    const uploaded: PendingCommentAttachment[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.set('file', file);

        const response = await fetch('/api/comments/upload', {
          method: 'POST',
          body: formData,
        });
        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          error?: string;
          key?: string;
          url?: string;
          mimeType?: string;
          sizeBytes?: number;
        } | null;

        if (!response.ok || !payload?.ok || !payload.url || !payload.mimeType) {
          throw new Error(payload?.error ?? 'Upload failed.');
        }

        uploaded.push({
          id: payload.key ?? payload.url,
          url: payload.url,
          mimeType: payload.mimeType,
          sizeBytes: payload.sizeBytes ?? file.size,
        });
      }

      setAttachments((previous) => [...previous, ...uploaded].slice(0, MAX_ATTACHMENTS));
    } catch (error) {
      setComposerError(error instanceof Error ? error.message : 'Could not upload image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!viewer || submitting || uploading) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    setComposerError(null);
    setSubmitting(true);

    const draftAttachments = attachments;
    const optimisticId = `optimistic-${crypto.randomUUID()}`;
    const optimisticComment: CommentView = {
      id: optimisticId,
      content: trimmed,
      createdAt: new Date(),
      author: viewer,
      attachments: attachments.map((attachment) => ({
        id: attachment.id,
        url: attachment.url,
        mimeType: attachment.mimeType,
        width: attachment.width ?? null,
        height: attachment.height ?? null,
      })),
      pending: true,
    };

    setComments((previous) => [optimisticComment, ...previous]);
    setContent('');
    setMentionIds(new Set());
    setAttachments([]);

    const result = await createComment(undefined, {
      mediaType,
      tmdbId,
      content: trimmed,
      // Client hint only; the server re-extracts mentions from content.
      mentionIds: [...mentionIds],
      attachments: attachments.map(({ url, mimeType, sizeBytes, width, height }) => ({
        url,
        mimeType,
        sizeBytes,
        width,
        height,
      })),
    });

    setSubmitting(false);

    if (result.success) {
      if (result.comment) {
        setComments((previous) =>
          previous.map((comment) => (comment.id === optimisticId ? result.comment! : comment)),
        );
      } else {
        setComments((previous) => previous.filter((comment) => comment.id !== optimisticId));
        void loadInitial();
      }
      return;
    }

    // Roll the optimistic node back and put the draft back in the composer.
    setComments((previous) => previous.filter((comment) => comment.id !== optimisticId));
    setContent(trimmed);
    setAttachments(draftAttachments);
    setComposerError(result.error ?? 'Could not post your review.');
    toastError(result.error, 'Couldn’t post comment.');
  };

  const signInHref = `/login?callbackUrl=${encodeURIComponent(`${pathname}?tab=reviews`)}`;
  const canSubmit = Boolean(viewer) && !submitting && !uploading && content.trim().length > 0;

  return (
    <div className="space-y-4">
      {showUnavailableNotice && (
        <div
          role="status"
          className="glass-card flex items-start gap-3 rounded-2xl border border-violet-400/25 bg-violet-500/8 p-4"
        >
          <IconAlertCircle size={16} className="mt-px shrink-0 text-violet-300" />
          <p className="flex-1 text-xs leading-relaxed text-zinc-300">
            That comment is unavailable — it may have been deleted. Showing the latest reviews
            instead.
          </p>
          <button
            type="button"
            onClick={() => setShowUnavailableNotice(false)}
            aria-label="Dismiss notice"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/8 hover:text-white"
          >
            <IconX size={13} />
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="glass-card space-y-3 rounded-3xl border border-white/10 p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 text-xs font-bold tracking-tight text-violet-300 uppercase">
          <IconMessage size={15} />
          <span>Write a public review</span>
        </div>

        <MentionComposerTextarea
          value={content}
          onChange={setContent}
          mentionIds={mentionIds}
          onMentionIdsChange={setMentionIds}
          disabled={!viewer || submitting}
          maxLength={COMMENT_MAX_LENGTH}
          invalid={composerError !== null}
          placeholder={
            viewer
              ? 'Share your thoughts with everyone... Type @ to mention someone.'
              : 'Sign in to share your thoughts with everyone.'
          }
        />

        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Attached images">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachment.url}
                  alt="Attachment preview"
                  className="size-20 rounded-xl border border-white/10 object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((previous) =>
                      previous.filter((item) => item.id !== attachment.id),
                    )
                  }
                  disabled={submitting}
                  aria-label="Remove attachment"
                  className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconX size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          className="sr-only"
          onChange={(event) => void handleFiles(event.target.files)}
        />

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!viewer || uploading || submitting || attachments.length >= MAX_ATTACHMENTS}
              className="apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <IconLoader2 size={14} className="animate-spin motion-reduce:animate-none" />
              ) : (
                <IconPhoto size={14} />
              )}
              {uploading ? 'Uploading…' : 'Attach image'}
            </button>
            <span className="text-[11px] text-zinc-500">
              {attachments.length}/{MAX_ATTACHMENTS}
            </span>
          </div>

          {viewer ? (
            <button
              type="submit"
              disabled={!canSubmit}
              className="apple-pill-btn cursor-pointer bg-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {submitting ? (
                <IconLoader2 size={15} className="animate-spin motion-reduce:animate-none" />
              ) : (
                <IconSend size={15} />
              )}
              {submitting ? 'Posting…' : 'Post review'}
            </button>
          ) : (
            <Link
              href={signInHref}
              className="apple-pill-btn bg-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 sm:text-sm"
            >
              <IconLock size={14} />
              Sign in to post
            </Link>
          )}
        </div>

        {composerError && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
          >
            <IconAlertCircle size={15} className="mt-px shrink-0" />
            <span>{composerError}</span>
          </p>
        )}
      </form>

      {status === 'loading' && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading public reviews">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      )}

      {status === 'error' && (
        <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 p-8 py-10 text-center">
          <IconAlertCircle size={20} className="text-rose-400" />
          <p role="alert" className="max-w-sm text-sm text-zinc-400">
            {feedError ?? 'Could not load reviews.'}
          </p>
          <button
            type="button"
            onClick={() => void loadInitial()}
            className="apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/12"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'ready' && comments.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 p-8 py-10 text-center">
          <IconMessage size={20} className="text-zinc-500" />
          <p className="text-sm text-zinc-400">
            No public reviews yet. Be the first to share yours.
          </p>
          {!viewer && (
            <Link
              href={signInHref}
              className="apple-pill-btn bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400"
            >
              Sign in to review
            </Link>
          )}
        </div>
      )}

      {status === 'ready' && comments.length > 0 && (
        <div className="space-y-3" aria-live="polite">
          {comments.map((comment) => {
            const authorName =
              comment.author.name?.trim() || comment.author.username || 'Chronicle user';
            const handle = comment.author.username;

            return (
              <article
                key={comment.id}
                id={`comment-${comment.id}`}
                aria-busy={comment.pending || undefined}
                className={`glass-card scroll-mt-24 space-y-3 rounded-3xl border border-white/10 p-5 transition-shadow target:border-violet-400/70 target:ring-2 target:ring-violet-400/50 motion-reduce:transition-none sm:p-6 ${
                  comment.pending ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {comment.author.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comment.author.image}
                      alt=""
                      className="size-9 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-500/25 bg-violet-500/15 text-[11px] font-bold text-violet-300">
                      {createMonogram(authorName).slice(0, 2) || 'CU'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-bold text-white">{authorName}</span>
                      {handle && (
                        <span className="text-xs font-medium text-zinc-500">@{handle}</span>
                      )}
                      <time
                        dateTime={new Date(comment.createdAt).toISOString()}
                        title={absoluteTime(comment.createdAt)}
                        className="text-[11px] text-zinc-500"
                      >
                        {relativeTime(comment.createdAt)}
                      </time>
                      {comment.pending && (
                        <span className="text-[11px] font-semibold text-violet-300">Posting…</span>
                      )}
                    </div>

                    <p className="mt-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-200">
                      {comment.content}
                    </p>

                    <div className="mt-3">
                      <CommentImageGrid attachments={toGridAttachments(comment)} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="apple-pill-btn w-full cursor-pointer border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/12 disabled:cursor-wait disabled:opacity-50"
            >
              {loadingMore ? (
                <IconLoader2 size={14} className="animate-spin motion-reduce:animate-none" />
              ) : null}
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicReviewsPanel;
