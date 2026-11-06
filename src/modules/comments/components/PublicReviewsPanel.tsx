'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  IconAlertCircle,
  IconCheck,
  IconLoader2,
  IconLock,
  IconMessage,
  IconPencil,
  IconPhoto,
  IconSend,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { createComment } from '@/modules/comments/actions/createComment';
import { deleteComment } from '@/modules/comments/actions/deleteComment';
import { updateComment } from '@/modules/comments/actions/updateComment';
import { listComments } from '@/modules/comments/services/listComments';
import { CommentImageGrid } from '@/modules/comments/components/CommentImageGrid';
import { CommentContent } from '@/modules/comments/components/CommentContent';
import { CommentReportButton } from '@/modules/comments/components/CommentReportButton';
import { CommentSkeleton } from '@/modules/comments/components/CommentSkeleton';
import {
  absoluteTime,
  relativeTime,
  toGridAttachments,
} from '@/modules/comments/lib/commentFeedFormat';
import { CommentReportForm } from '@/modules/comments/components/CommentReportForm';
import { MentionComposerTextarea } from '@/modules/comments/components/MentionComposerTextarea';
import {
  COMMENT_ALLOWED_IMAGE_TYPES,
  COMMENT_MAX_IMAGE_BYTES,
  COMMENT_MAX_LENGTH,
  COMMENT_REVIEW_PAGE_SIZE,
  MAX_ATTACHMENTS,
} from '@/modules/comments/constants';
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

  // Owner-only affordances on the viewer's own comments.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMentionIds, setEditMentionIds] = useState<Set<string>>(new Set());
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  // Reporting is per review: `reportingId` opens one form, `reportedIds` retires
  // the flag once the server accepted it.
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(() => new Set());
  const [feedActionError, setFeedActionError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setStatus('loading');
    setFeedError(null);

    const result = await listComments(mediaType, tmdbId, undefined, COMMENT_REVIEW_PAGE_SIZE);
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
    const result = await listComments(mediaType, tmdbId, cursor, COMMENT_REVIEW_PAGE_SIZE);
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

    const invalidType = files.find((file) => !COMMENT_ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      setComposerError('Only JPEG, PNG, and WebP images are supported.');
      return;
    }

    const tooLarge = files.find((file) => file.size > COMMENT_MAX_IMAGE_BYTES);
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

  const startEdit = (comment: CommentView) => {
    setFeedActionError(null);
    setConfirmingDeleteId(null);
    setEditingId(comment.id);
    setEditContent(comment.content);
    setEditMentionIds(new Set());
  };

  const submitEdit = async (commentId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed || savingEdit) return;

    setFeedActionError(null);
    setSavingEdit(true);

    const result = await updateComment(commentId, { content: trimmed });
    setSavingEdit(false);

    if (!result.success || !result.comment) {
      setFeedActionError(result.error ?? 'Could not update your comment.');
      toastError(result.error, 'Couldn’t update comment.');
      return;
    }

    const updated = result.comment;
    setComments((previous) =>
      previous.map((comment) => (comment.id === commentId ? updated : comment)),
    );
    setEditingId(null);
  };

  const handleDelete = async (commentId: string) => {
    setFeedActionError(null);
    setDeletingId(commentId);

    const result = await deleteComment(commentId);
    setDeletingId(null);
    setConfirmingDeleteId(null);

    if (!result.success) {
      setFeedActionError(result.error ?? 'Could not delete your comment.');
      toastError(result.error, 'Couldn’t delete comment.');
      return;
    }

    setComments((previous) => previous.filter((comment) => comment.id !== commentId));
    if (editingId === commentId) setEditingId(null);
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
          accept={COMMENT_ALLOWED_IMAGE_TYPES.join(',')}
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
            <span className="text-[11px] text-zinc-400">
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

      {feedActionError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
        >
          <IconAlertCircle size={15} className="mt-px shrink-0" />
          <span>{feedActionError}</span>
        </p>
      )}

      {status === 'ready' && comments.length > 0 && (
        <div className="space-y-3" aria-live="polite">
          {comments.map((comment) => {
            const authorName =
              comment.author.name?.trim() || comment.author.username || 'Chronicle user';
            const handle = comment.author.username;
            // Ownership is decided by the server-provided viewer id only.
            const isOwn = Boolean(viewer && viewer.id === comment.author.id);
            const isEditing = editingId === comment.id;
            const isConfirmingDelete = confirmingDeleteId === comment.id;
            const isDeleting = deletingId === comment.id;
            const isHidden = Boolean(comment.hidden);
            const canReport = Boolean(viewer) && !isOwn && !comment.pending && !reportedIds.has(comment.id);

            return (
              <article
                key={comment.id}
                id={`comment-${comment.id}`}
                aria-busy={comment.pending || undefined}
                className={`glass-card scroll-mt-24 space-y-3 rounded-3xl border p-5 transition-shadow target:border-violet-400/70 target:ring-2 target:ring-violet-400/50 motion-reduce:transition-none sm:p-6 ${
                  isHidden ? 'border-amber-400/30' : 'border-white/10'
                } ${comment.pending ? 'opacity-70' : ''}`}
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
                        <span className="text-xs font-medium text-zinc-400">@{handle}</span>
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

                      {canReport && !isEditing && (
                        <span className="ml-auto flex items-center gap-1">
                          <CommentReportButton onOpen={() => setReportingId(comment.id)} />
                        </span>
                      )}

                      {isOwn && !comment.pending && !isEditing && (
                        <span className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(comment)}
                            aria-label="Edit your comment"
                            title="Edit comment"
                            className="flex size-7 cursor-pointer items-center justify-center rounded-lg bg-white/6 text-zinc-300 transition-colors hover:bg-white/12 hover:text-white"
                          >
                            <IconPencil size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              isConfirmingDelete
                                ? void handleDelete(comment.id)
                                : setConfirmingDeleteId(comment.id)
                            }
                            disabled={isDeleting}
                            aria-label={
                              isConfirmingDelete ? 'Confirm delete comment' : 'Delete your comment'
                            }
                            title={isConfirmingDelete ? 'Click again to delete' : 'Delete comment'}
                            className={`flex size-7 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-wait disabled:opacity-60 ${
                              isConfirmingDelete
                                ? 'bg-rose-600/80 text-white hover:bg-rose-500'
                                : 'bg-white/6 text-zinc-300 hover:bg-rose-500/20 hover:text-rose-300'
                            }`}
                          >
                            {isDeleting ? (
                              <IconLoader2
                                size={12}
                                className="animate-spin motion-reduce:animate-none"
                              />
                            ) : isConfirmingDelete ? (
                              <IconCheck size={12} />
                            ) : (
                              <IconTrash size={12} />
                            )}
                          </button>
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <MentionComposerTextarea
                          value={editContent}
                          onChange={setEditContent}
                          mentionIds={editMentionIds}
                          onMentionIdsChange={setEditMentionIds}
                          disabled={savingEdit}
                          maxLength={COMMENT_MAX_LENGTH}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            disabled={savingEdit}
                            className="apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void submitEdit(comment.id)}
                            disabled={savingEdit || editContent.trim().length === 0}
                            className="apple-pill-btn cursor-pointer bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingEdit ? (
                              <IconLoader2
                                size={13}
                                className="animate-spin motion-reduce:animate-none"
                              />
                            ) : null}
                            Save changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {isHidden && (
                          <p
                            role="status"
                            className="mt-2 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-200"
                          >
                            <IconAlertCircle size={13} className="mt-px shrink-0" />
                            <span>
                              Hidden from public view —{' '}
                              {comment.hiddenReason ?? 'a moderator hid this review.'}
                            </span>
                          </p>
                        )}

                        <CommentContent content={comment.content} className="mt-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-200" />

                        <div className="mt-3">
                          <CommentImageGrid attachments={toGridAttachments(comment)} />
                        </div>

                        {reportingId === comment.id && (
                          <CommentReportForm
                            commentId={comment.id}
                            onClose={() => setReportingId(null)}
                            onReported={() =>
                              setReportedIds((current) => new Set(current).add(comment.id))
                            }
                          />
                        )}
                      </>
                    )}
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
