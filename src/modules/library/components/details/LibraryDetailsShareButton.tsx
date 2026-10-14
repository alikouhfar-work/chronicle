'use client';

import { useState } from 'react';
import { IconCheck, IconLoader2, IconShare2 } from '@tabler/icons-react';
import { clsx } from 'clsx';
import type { LibraryDetailsShareButtonProps } from '@/modules/library/types/libraryDetailsShareButton';
import { buildShareMessage } from '@/modules/library/lib/buildShareMessage';
import { toastError } from '@/shared/lib/toast';

type ShareState = 'idle' | 'sharing' | 'copied';

const isDismissal = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { name?: unknown }).name === 'AbortError';

/** Best-effort poster attach for the native sheet (falls back to a poster URL in text). */
const fetchPosterFile = async (posterUrl: string | null): Promise<File[] | undefined> => {
  if (!posterUrl) return undefined;
  try {
    const response = await fetch(posterUrl);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    if (!blob.size) return undefined;
    return [new File([blob], 'poster.jpg', { type: blob.type || 'image/jpeg' })];
  } catch {
    return undefined;
  }
};

const copyMessage = async (message: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    return false;
  }
};

export const LibraryDetailsShareButton = ({
  media,
  mediaType,
  credits,
}: LibraryDetailsShareButtonProps) => {
  const [state, setState] = useState<ShareState>('idle');

  const flashCopied = () => {
    setState('copied');
    setTimeout(() => setState('idle'), 2000);
  };

  const handleShare = async () => {
    if (state !== 'idle') return;
    // Prefer the public app URL when configured: shares sent from a dev
    // server would otherwise carry a localhost link that no device can open.
    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || window.location.origin;
    const { title, text, url, posterUrl } = buildShareMessage({
      media,
      mediaType,
      credits,
      origin,
    });
    // Clipboard fallback carries the full message, not just the link, so a
    // paste still shows poster, name, year, and details link. The headline
    // already leads the text, so no prefix is needed.
    const fullMessage = text;

    // Native sheet (mobile / PWA / desktop Chrome) when available.
    if (typeof navigator.share === 'function') {
      setState('sharing');
      try {
        const files = await fetchPosterFile(posterUrl);
        const withFiles = files && typeof navigator.canShare === 'function' && navigator.canShare({ files });
        await navigator.share(withFiles ? { title, text, url, files } : { title, text, url });
      } catch (error) {
        // User dismissed the sheet — stay silent. Anything else falls
        // back to copying the link so the tap never feels dead.
        // (Name check instead of instanceof: DOMException is not an Error.)
        if (isDismissal(error)) return;
        if (await copyMessage(fullMessage)) flashCopied();
        else toastError('Could not share this title. Please try again.');
      } finally {
        setState((current) => (current === 'sharing' ? 'idle' : current));
      }
      return;
    }

    if (await copyMessage(fullMessage)) flashCopied();
    else toastError('Could not copy the link. Please try again.');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={state === 'sharing'}
      aria-label={`Share ${media.name}`}
      className={clsx(
        'apple-pill-btn shrink-0 cursor-pointer border px-3.5 py-1.5 text-xs disabled:cursor-wait',
        state === 'copied'
          ? 'border-emerald-500/40 bg-emerald-500/15 font-semibold text-emerald-300'
          : 'border-white/10 bg-white/[0.04] font-semibold text-zinc-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white',
      )}
    >
      {state === 'sharing' ? (
        <IconLoader2 size={13} className="animate-spin text-violet-400" />
      ) : state === 'copied' ? (
        <IconCheck size={13} className="text-emerald-400" />
      ) : (
        <IconShare2 size={13} className="text-violet-400" />
      )}
      <span>{state === 'sharing' ? 'Sharing…' : state === 'copied' ? 'Copied!' : 'Share'}</span>
    </button>
  );
};
