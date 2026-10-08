import Link from 'next/link';
import { IconExternalLink } from '@tabler/icons-react';
import { AuthShell } from '@/shared/ui/AuthShell';
import { TmdbTokenForm } from '@/shared/ui/TmdbTokenForm';

export const dynamic = 'force-dynamic';

const steps = [
  {
    n: '1',
    title: 'Get your read-access token',
    body: 'On TMDB, open your API settings and copy the v4 read-access token (it starts with eyJ).',
  },
  {
    n: '2',
    title: 'Paste it below',
    body: 'Chronicle validates the token with TMDB, then stores it encrypted. It is never shown again.',
  },
];

const OnboardingTmdbPage = () => {
  return (
    <AuthShell
      width="md"
      eyebrow="One last step"
      title="Connect your TMDB token"
      description="Catalogue data — search, trending, artwork — is fetched with your own token."
      footer="You can rotate or remove this token anytime from Settings."
    >
      <ol className="mb-5 space-y-3">
        {steps.map((step) => (
          <li
            key={step.n}
            className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <span className="apple-badge shrink-0 border border-violet-500/25 bg-violet-500/15 text-[11px] text-violet-300">
              {step.n}
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-100">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href="https://www.themoviedb.org/settings/api"
        target="_blank"
        rel="noreferrer"
        className="apple-pill-btn mb-5 w-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-100 hover:border-white/20 hover:bg-white/[0.07]"
      >
        Open TMDB API settings
        <IconExternalLink size={16} />
      </Link>

      <TmdbTokenForm redirectTo="/" showRemove={false} />
    </AuthShell>
  );
};

export default OnboardingTmdbPage;
