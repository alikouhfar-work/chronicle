'use client';

import { type ButtonHTMLAttributes, useState } from 'react';
import {
  IconAlertTriangle,
  IconBookmark,
  IconBug,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconInfoCircle,
  IconLayoutDashboard,
  IconRefresh,
  IconShieldExclamation,
  IconSparkles,
  IconTerminal2,
} from '@tabler/icons-react';
import { clsx } from 'clsx';

export interface NextJSErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  onBack?: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'library' | 'search') => void;
  title?: string;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
};

const Button = ({ variant = 'ghost', size = 'md', className, ...props }: ButtonProps) => (
  <button
    {...props}
    className={clsx(
      'apple-pill-btn inline-flex cursor-pointer items-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60',
      variant === 'primary'
        ? 'bg-rose-600 font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:bg-rose-800/60'
        : 'border border-white/10 bg-white/6 font-semibold text-zinc-200 hover:bg-white/12',
      size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-xs sm:text-sm',
      className,
    )}
  />
);

function MetaCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="space-y-1 rounded-2xl border border-white/6 bg-white/3 p-3">
      <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
        {label}
      </span>
      <span className={clsx('block truncate font-mono text-xs font-bold', tone)}>{value}</span>
    </div>
  );
}

const Error = ({ error, reset, onBack, onNavigateTab, title }: NextJSErrorProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showStack, setShowStack] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);

  // Next.js produces an error digest hash for server & client errors
  const digest =
    error.digest ||
    'nextjs_err_' +
      Math.abs(
        (error.message || 'unknown')
          .split('')
          .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0),
      )
        .toString(16)
        .padStart(8, '0');

  const copyWithFeedback = async (text: string, done: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    done(true);
    setTimeout(() => done(false), 2000);
  };

  const handleReset = () => {
    setIsRetrying(true);
    // Simulate re-rendering the segment as Next.js reset() does
    setTimeout(() => {
      try {
        reset();
      } finally {
        setIsRetrying(false);
      }
    }, 650);
  };

  const handleCopyFullDetails = () =>
    copyWithFeedback(
      [
        '[Next.js Error Report - Media Details]',
        `Digest: ${digest}`,
        `Timestamp: ${new Date().toISOString()}`,
        `Error: ${error.name || 'Error'}: ${error.message || 'Unknown error'}`,
        `Target: ${title || 'Media Details View'}`,
        `Stack Trace:\n${error.stack || 'No stack trace available'}`,
      ].join('\n'),
      setCopiedDetails,
    );

  return (
    <div id="media-error-boundary-view" className="animate-fade-in space-y-6 pb-16 font-sans">
      {/* Hero card */}
      <div className="glass-panel relative overflow-hidden rounded-3xl border border-rose-500/20 p-8 text-center shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-600/15 blur-3xl" />
        <div className="pointer-events-none absolute right-8 -bottom-16 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-xl space-y-6">
          {/* Icon glyph */}
          <div className="relative inline-flex items-center justify-center">
            <div className="group flex h-24 w-24 items-center justify-center rounded-3xl border border-rose-500/30 bg-linear-to-br from-rose-600/25 via-zinc-900/90 to-amber-900/20 shadow-2xl ring-1 shadow-rose-950/60 ring-white/10 backdrop-blur-xl sm:h-28 sm:w-28">
              <IconAlertTriangle
                size={52}
                className="text-rose-400 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-linear-to-r from-rose-500/20 to-violet-500/20 blur-xl" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
              <IconShieldExclamation size={14} className="text-rose-400" />
              Caught by Segment Error Boundary
            </span>

            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl">
              Something went wrong
            </h1>

            <p className="mx-auto max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              {error.message ||
                'An unexpected runtime exception occurred while rendering this media detail view. The component boundary prevented the entire application from crashing.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              id="error-try-again-btn"
              variant="primary"
              onClick={handleReset}
              disabled={isRetrying}
              className="group px-6"
            >
              <IconRefresh
                size={16}
                className={clsx(
                  'transition-transform duration-700',
                  isRetrying ? 'animate-spin' : 'group-hover:-rotate-45',
                )}
              />
              <span>{isRetrying ? 'Retrying Segment…' : 'Try Again'}</span>
            </Button>

            {onBack && (
              <Button id="error-return-library-btn" onClick={onBack}>
                <IconBookmark size={16} className="text-violet-400" />
                <span>Return to Library</span>
              </Button>
            )}

            {onNavigateTab && (
              <Button id="error-go-dashboard-btn" onClick={() => onNavigateTab('dashboard')}>
                <IconLayoutDashboard size={16} className="text-zinc-400" />
                <span>Dashboard</span>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-zinc-400">
            <IconInfoCircle size={14} className="shrink-0 text-zinc-500" />
            <span>
              Invoking{' '}
              <code className="rounded bg-white/6 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
                reset()
              </code>{' '}
              will re-render the route segment without a full page reload.
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="glass-card space-y-4 rounded-3xl border border-white/8 p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <IconTerminal2 size={16} className="text-rose-400" />
              Next.js Error Diagnostics
            </h3>
            <p className="text-xs text-zinc-400">
              Technical details and stack trace captured by the React Error Boundary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCopyFullDetails}
              title="Copy complete error diagnostics for reporting"
            >
              {copiedDetails ? (
                <>
                  <IconCheck size={13} className="text-emerald-400" />
                  <span className="font-semibold text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <IconCopy size={13} className="text-zinc-400" />
                  <span>Copy Report</span>
                </>
              )}
            </Button>

            <Button size="sm" onClick={() => setShowStack(!showStack)}>
              <IconBug size={13} className="text-rose-400" />
              <span>{showStack ? 'Hide Stack' : 'Inspect Stack'}</span>
              {showStack ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
          <MetaCard label="Error Type" value={error.name || 'Error'} tone="text-rose-300" />
          <MetaCard label="Digest ID" value={digest} tone="text-violet-300" />
          <MetaCard label="Boundary Scope" value="/media/[id]/page" tone="text-zinc-300" />
        </div>

        {showStack && (
          <div className="animate-fade-in space-y-2 pt-2">
            <p className="px-1 font-mono text-[11px] text-rose-300">
              {error.name || 'Error'}: {error.message}
            </p>

            <div className="max-h-72 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] leading-relaxed text-zinc-400 select-text">
              <pre className="wrap-break-word whitespace-pre-wrap">
                {error.stack ||
                  `${error.name || 'Error'}: ${error.message}\n    at MediaDetails (src/components/MediaDetails.tsx:275)\n    at MediaDetailsErrorBoundary (src/components/MediaErrorBoundary.tsx:28)`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Advice */}
      <div className="glass-card flex items-start gap-3.5 rounded-3xl border border-white/6 p-5 text-xs text-zinc-400">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
          <IconSparkles size={16} />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white">Troubleshooting Advice</h4>
          <p className="leading-relaxed">
            If retrying with <code className="font-mono text-zinc-300">reset()</code> persists in
            failing, verify your connection to TMDB, clear any corrupted browser session entries in
            settings, or navigate back to the library.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error;
