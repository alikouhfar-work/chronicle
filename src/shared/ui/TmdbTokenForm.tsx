'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLoader2,
  IconShieldCheck,
  IconTrash,
} from '@tabler/icons-react';
import { saveTmdbToken, deleteTmdbToken } from '@/infra/tmdb/actions';

export const TmdbTokenForm = ({
  redirectTo,
  configured,
  updatedAt,
  showRemove = true,
}: {
  redirectTo?: string;
  configured?: boolean;
  updatedAt?: Date | null;
  showRemove?: boolean;
}) => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await saveTmdbToken(token);
      if (!result.ok) {
        setError(result.error ?? 'Could not save token.');
        return;
      }
      setToken('');
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setSuccess(true);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  const onRemove = async () => {
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }
    setRemoving(true);
    try {
      await deleteTmdbToken();
      setConfirmingRemove(false);
      router.refresh();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      {configured && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <span className="apple-badge border border-emerald-500/25 bg-emerald-500/15 text-[11px] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Token active
          </span>
          {updatedAt && (
            <span className="text-xs text-zinc-400">
              Saved {updatedAt.toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      <form onSubmit={onSave} className="space-y-3">
        <div>
          <label htmlFor="tmdb-token" className="mb-1.5 block text-xs font-semibold text-zinc-300">
            {configured ? 'New read-access token' : 'Read-access token'}
          </label>
          <div className="relative">
            <input
              id="tmdb-token"
              type={visible ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setSuccess(false);
              }}
              placeholder="eyJ..."
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 pr-11 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Hide token' : 'Show token'}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-zinc-500 transition-colors hover:text-zinc-200"
            >
              {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">
            Starts with <span className="font-mono">eyJ</span> — we validate it with TMDB before
            saving.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <IconAlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            <IconCheck size={17} className="mt-0.5 shrink-0" />
            <span>Token validated and saved.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending || token.trim().length === 0}
          className="apple-pill-btn w-full bg-violet-500 px-5 py-2.5 text-sm text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : configured ? (
            <IconKey size={16} />
          ) : (
            <IconArrowRight size={16} />
          )}
          {pending ? 'Validating with TMDB…' : configured ? 'Save new token' : 'Validate & save'}
        </button>
      </form>

      {showRemove && configured && (
        <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="flex items-center gap-2.5">
            <IconShieldCheck size={16} className="shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-500">Stored encrypted. Never displayed again.</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            onBlur={() => setConfirmingRemove(false)}
            disabled={removing}
            className={`apple-pill-btn shrink-0 border px-4 py-1.5 text-xs disabled:cursor-wait disabled:opacity-60 ${
              confirmingRemove
                ? 'border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25'
                : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:border-red-500/30 hover:text-red-300'
            }`}
          >
            {removing ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : (
              <IconTrash size={14} />
            )}
            {confirmingRemove ? 'Confirm remove' : 'Remove'}
          </button>
        </div>
      )}
    </div>
  );
};
