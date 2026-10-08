'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLoader2,
} from '@tabler/icons-react';
import { register } from '@/infra/auth/actions';

export const SignupForm = ({ callbackUrl }: { callbackUrl: string }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    !pending && email.trim().length > 0 && password.length >= 8 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setPending(true);
    try {
      const result = await register(email, password);
      if (!result.ok) {
        setError(result.error ?? 'Could not create your account.');
        setPending(false);
        return;
      }
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        redirectTo: callbackUrl,
      });
      if (signInResult?.error) {
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }
      router.push(signInResult?.url ?? callbackUrl);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <IconAlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold text-zinc-300">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-xs font-semibold text-zinc-300"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 pr-11 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-zinc-500 transition-colors hover:text-zinc-200"
            >
              {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="signup-confirm"
            className="mb-1.5 block text-xs font-semibold text-zinc-300"
          >
            Confirm password
          </label>
          <input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className={`w-full rounded-xl border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none ${
              mismatch
                ? 'border-red-500/50 focus:border-red-400/60 focus:ring-2 focus:ring-red-500/20'
                : 'border-white/10 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20'
            }`}
          />
          {mismatch ? (
            <p className="mt-1.5 text-xs text-red-400">Passwords do not match.</p>
          ) : (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
              <IconCheck
                size={13}
                className={password.length >= 8 ? 'text-emerald-400' : 'text-zinc-600'}
              />
              <span className={password.length >= 8 ? 'text-zinc-400' : undefined}>
                Minimum 8 characters
              </span>
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="apple-pill-btn w-full bg-violet-500 px-5 py-2.5 text-sm text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <IconArrowRight size={16} />
          )}
          Create account
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-violet-400 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
