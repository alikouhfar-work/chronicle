'use client';

import {
  IconAlertTriangle,
  IconCopy,
  IconShieldExclamation,
  IconSparkles,
} from '@tabler/icons-react';

const MainError = ({
  error,
  reset,
  onBack,
}: {
  error: Error;
  reset: () => void;
  onBack?: () => void;
}) => {
  return (
    <div className="bg-canvas min-h-screen font-sans antialiased">
      {/* Hero section with glass panel */}
      <div className="relative overflow-hidden">
        <div className="glass-panel rounded-3xl border border-white/8 p-8 text-center shadow-2xl sm:p-12">
          {/* Ambient lighting orbs */}
          <div className="pointer-events-none absolute -top-16 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-600/15 blur-3xl" />
          <div className="pointer-events-none absolute right-10 -bottom-16 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

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
                Caught by Error Boundary
              </span>

              <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl">
                Something went wrong
              </h1>

              <p className="mx-auto max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
                An unexpected runtime exception occurred. The error boundary prevented the entire
                application from crashing.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="error-try-again-btn"
                className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 active:scale-95"
                onClick={reset}
              >
                <IconAlertTriangle
                  size={16}
                  className="transition-transform duration-700 group-hover:-rotate-45"
                />
                <span>Try Again</span>
              </button>

              {onBack && (
                <button
                  id="error-return-library-btn"
                  className="apple-pill-btn inline-flex cursor-pointer items-center gap-2 border border-white/10 bg-white/8 px-5 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/[0.15] active:scale-95 sm:text-sm"
                  onClick={onBack}
                >
                  <IconShieldExclamation size={16} className="text-zinc-400" />
                  <span>Return to Library</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostics card */}
        <div className="glass-card relative mt-8 rounded-3xl border border-white/8 p-6 sm:mt-10 sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <IconShieldExclamation size={16} className="text-rose-400" />
                Next.js Error Diagnostics
              </h3>
              <p className="text-xs text-zinc-400">
                Technical details and stack trace captured by the React Error Boundary.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Copy complete error diagnostics for reporting"
              >
                <IconCopy size={13} className="text-zinc-400" />
                <span>Copy Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
            <div>
              <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Error Type
              </span>
              <span className="block truncate font-mono text-xs font-bold text-rose-300">
                {error.name || 'Error'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Message
              </span>
              <span className="block truncate font-mono text-xs font-bold text-violet-300">
                {error.message}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Boundary
              </span>
              <span className="block truncate font-mono text-xs font-bold text-zinc-300">
                Root Error Boundary
              </span>
            </div>
          </div>

          {error.stack && (
            <div className="animate-fade-in space-y-2 pt-2">
              <p className="px-1 font-mono text-[11px] text-rose-300">
                {error.name || 'Error'}: {error.message}
              </p>
              <div className="max-h-72 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] leading-relaxed text-zinc-400 select-text">
                <pre className="wrap-break-word whitespace-pre-wrap">{error.stack}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Advice section */}
        <div className="glass-card mt-8 flex items-start gap-3.5 rounded-3xl border border-white/6 p-5 text-xs text-zinc-400 sm:mt-10 sm:p-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
            <IconSparkles size={16} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Troubleshooting Advice</h4>
            <p className="leading-relaxed">
              If retrying persists in failing, verify your connection, clear any corrupted browser
              session entries in settings, or navigate back to the library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainError;
