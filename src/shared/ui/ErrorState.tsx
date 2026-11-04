import Link from 'next/link';
import { IconAlertTriangle, IconRefresh, IconArrowLeft } from '@tabler/icons-react';
import { clsx } from 'clsx';
import type { ErrorStateProps } from '@/shared/types/errorState';

/**
 * The user-facing failure surface. Deliberately plain: what happened, a retry,
 * and a way back. Stack traces and diagnostics stay in the server logs; only
 * the digest is shown, and only so support can correlate a report.
 */
export const ErrorState = ({
  title = 'Something went wrong',
  description = 'This page could not be loaded. Your library and reviews are safe — try again, or head back.',
  onRetry,
  backHref = '/library',
  backLabel = 'Back to library',
  digest,
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={clsx(
      'glass-card mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl p-8 text-center sm:p-10',
      className,
    )}
  >
    <div
      aria-hidden
      className="rounded-2xl border border-rose-500/25 bg-rose-500/12 p-3.5 text-rose-300"
    >
      <IconAlertTriangle size={28} />
    </div>

    <div className="space-y-2">
      <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h1>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
      {onRetry ? (
        <button
          id="error-try-again-btn"
          type="button"
          onClick={onRetry}
          className="apple-pill-btn cursor-pointer bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500"
        >
          <IconRefresh size={16} />
          <span>Try again</span>
        </button>
      ) : null}

      <Link
        href={backHref}
        className="apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-white/12"
      >
        <IconArrowLeft size={16} />
        <span>{backLabel}</span>
      </Link>
    </div>

    {digest ? (
      <p className="font-mono text-[11px] text-zinc-400 select-text">Reference: {digest}</p>
    ) : null}
  </div>
);
