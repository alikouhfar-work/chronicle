'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { SignupFormProps } from '@/modules/auth/types/signupForm';
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLoader2,
} from '@tabler/icons-react';
import { register } from '@/infra/auth/actions';

export const SignupForm = ({ callbackUrl }: SignupFormProps) => {
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
          className="flex items-start gap-2.5 rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          <IconAlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
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
            className="w-full rounded-control border border-line-control bg-surface-raised/80 px-4 py-2.5 text-base text-ink placeholder:text-ink-subtle focus:border-accent-ink focus-visible:ring-2 focus:ring-accent/40 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-xs font-semibold text-ink-secondary"
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
              className="w-full rounded-control border border-line-control bg-surface-raised/80 px-4 py-2.5 pr-11 text-base text-ink placeholder:text-ink-subtle focus:border-accent-ink focus-visible:ring-2 focus:ring-accent/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-pill p-1 text-ink-subtle transition-colors hover:text-ink-secondary"
            >
              {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="signup-confirm"
            className="mb-1.5 block text-xs font-semibold text-ink-secondary"
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
            className={`w-full rounded-control border bg-surface-raised/80 px-4 py-2.5 text-base text-ink placeholder:text-ink-subtle focus-visible:ring-2 focus:ring-accent/40 focus:outline-none ${
              mismatch
                ? 'border-danger/30 focus:border-danger/30 focus-visible:ring-2 focus:ring-danger/30'
                : 'border-line focus:border-accent-ink focus-visible:ring-2 focus:ring-accent/40'
            }`}
          />
          {mismatch ? (
            <p className="mt-1.5 text-xs text-danger">Passwords do not match.</p>
          ) : (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
              <IconCheck
                size={13}
                className={password.length >= 8 ? 'text-success' : 'text-ink-subtle'}
              />
              <span className={password.length >= 8 ? 'text-ink-muted' : undefined}>
                Minimum 8 characters
              </span>
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="apple-pill-btn w-full bg-accent px-5 py-2.5 text-sm text-ink shadow-lg shadow-accent/25 hover:bg-accent-strong disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <IconArrowRight size={16} />
          )}
          Create account
        </button>
      </form>

      <p className="text-center text-xs text-ink-muted">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-accent-ink underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
