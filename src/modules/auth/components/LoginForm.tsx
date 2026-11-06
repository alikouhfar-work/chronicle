'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { LoginFormProps } from '@/modules/auth/types/loginForm';
import {
  IconAlertCircle,
  IconArrowRight,
  IconBrandGoogle,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconMail,
  IconSparkles,
} from '@tabler/icons-react';
import type { AuthProviderId } from '@/infra/auth/auth';

const providerIcon = (id: AuthProviderId) => {
  if (id === 'google') return IconBrandGoogle;
  if (id === 'guest') return IconSparkles;
  return IconMail;
};

export const LoginForm = ({ providers, callbackUrl, authError }: LoginFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<AuthProviderId | null>(null);
  const [error, setError] = useState<string | null>(authError);

  const showCredentials = providers.some((p) => p.id === 'credentials');
  const oauthProviders = providers.filter((p) => p.id !== 'credentials' && p.id !== 'guest');
  const guestProvider = providers.find((p) => p.id === 'guest');
  const busy = pendingProvider !== null;

  const handleOAuth = (id: AuthProviderId) => {
    setError(null);
    setPendingProvider(id);
    signIn(id, { redirectTo: callbackUrl });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingProvider('credentials');
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        redirectTo: callbackUrl,
      });
      if (result?.error) {
        setError('Incorrect email or password. Please try again.');
        setPendingProvider(null);
        return;
      }
      router.push(result?.url ?? callbackUrl);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setPendingProvider(null);
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

      {oauthProviders.map((provider) => {
        const Icon = providerIcon(provider.id);
        const pending = pendingProvider === provider.id;
        return (
          <button
            key={provider.id}
            type="button"
            disabled={busy}
            onClick={() => handleOAuth(provider.id)}
            className="apple-pill-btn w-full border border-line bg-white/[0.04] px-5 py-2.5 text-sm text-ink hover:border-line-strong hover:bg-white/[0.07] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? <IconLoader2 size={16} className="animate-spin" /> : <Icon size={16} />}
            Continue with {provider.name}
          </button>
        );
      })}

      {showCredentials && (
        <>
          {oauthProviders.length > 0 && (
            <div className="flex items-center gap-3 text-micro font-medium tracking-wide text-ink-subtle uppercase">
              <span className="h-px flex-1 bg-surface-soft" />
              or with email
              <span className="h-px flex-1 bg-surface-soft" />
            </div>
          )}
          <form onSubmit={handleEmail} className="space-y-3">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-semibold text-ink-secondary"
              >
                Email
              </label>
              <input
                id="login-email"
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
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-semibold text-ink-secondary"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            <button
              type="submit"
              disabled={busy || email.trim().length === 0 || password.length === 0}
              className="apple-pill-btn w-full bg-accent px-5 py-2.5 text-sm text-ink shadow-lg shadow-accent/25 hover:bg-accent-strong disabled:cursor-wait disabled:opacity-60"
            >
              {pendingProvider === 'credentials' ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconArrowRight size={16} />
              )}
              Sign in
            </button>
          </form>
          <p className="text-center text-xs text-ink-muted">
            New to Chronicle?{' '}
            <Link
              href="/signup"
              className="font-semibold text-accent-ink underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </>
      )}

      {guestProvider && (
        <>
          <div className="flex items-center gap-3 text-micro font-medium tracking-wide text-ink-subtle uppercase">
            <span className="h-px flex-1 bg-surface-soft" />
            or try the demo
            <span className="h-px flex-1 bg-surface-soft" />
          </div>
          <div>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleOAuth('guest')}
              className="apple-pill-btn w-full border border-success/30 bg-success-soft px-5 py-2.5 text-sm text-success hover:border-success/40 hover:bg-success-soft disabled:cursor-wait disabled:opacity-60"
            >
              {pendingProvider === 'guest' ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconSparkles size={16} />
              )}
              Continue as guest
            </button>
            <p className="mt-1.5 text-center text-micro leading-relaxed text-ink-subtle">
              Shared demo library on its own database. Resets periodically.
            </p>
          </div>
        </>
      )}

      {providers.length === 0 && (
        <div className="rounded-control border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-rating">
          No sign-in providers are configured. Add OAuth credentials or enable development mode.
        </div>
      )}
    </div>
  );
};
