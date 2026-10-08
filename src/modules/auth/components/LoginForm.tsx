'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
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

export const LoginForm = ({
  providers,
  callbackUrl,
  authError,
}: {
  providers: { id: AuthProviderId; name: string }[];
  callbackUrl: string;
  authError: string | null;
}) => {
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
          className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
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
            className="apple-pill-btn w-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-100 hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? <IconLoader2 size={16} className="animate-spin" /> : <Icon size={16} />}
            Continue with {provider.name}
          </button>
        );
      })}

      {showCredentials && (
        <>
          {oauthProviders.length > 0 && (
            <div className="flex items-center gap-3 text-[11px] font-medium tracking-wide text-zinc-600 uppercase">
              <span className="h-px flex-1 bg-white/8" />
              or with email
              <span className="h-px flex-1 bg-white/8" />
            </div>
          )}
          <form onSubmit={handleEmail} className="space-y-3">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-semibold text-zinc-300"
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
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-semibold text-zinc-300"
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
            <button
              type="submit"
              disabled={busy || email.trim().length === 0 || password.length === 0}
              className="apple-pill-btn w-full bg-violet-500 px-5 py-2.5 text-sm text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
            >
              {pendingProvider === 'credentials' ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconArrowRight size={16} />
              )}
              Sign in
            </button>
          </form>
          <p className="text-center text-xs text-zinc-500">
            New to Chronicle?{' '}
            <Link
              href="/signup"
              className="font-semibold text-violet-400 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </>
      )}

      {guestProvider && (
        <>
          <div className="flex items-center gap-3 text-[11px] font-medium tracking-wide text-zinc-600 uppercase">
            <span className="h-px flex-1 bg-white/8" />
            or try the demo
            <span className="h-px flex-1 bg-white/8" />
          </div>
          <div>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleOAuth('guest')}
              className="apple-pill-btn w-full border border-emerald-500/25 bg-emerald-500/10 px-5 py-2.5 text-sm text-emerald-200 hover:border-emerald-500/40 hover:bg-emerald-500/15 disabled:cursor-wait disabled:opacity-60"
            >
              {pendingProvider === 'guest' ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconSparkles size={16} />
              )}
              Continue as guest
            </button>
            <p className="mt-1.5 text-center text-[11px] leading-relaxed text-zinc-600">
              Shared demo library on its own database. Resets periodically.
            </p>
          </div>
        </>
      )}

      {providers.length === 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          No sign-in providers are configured. Add OAuth credentials or enable development mode.
        </div>
      )}
    </div>
  );
};
