import { IconKey, IconLock, IconRefresh, IconEyeOff } from '@tabler/icons-react';
import { getTmdbTokenStatus } from '@/infra/tmdb/actions';
import { TmdbTokenForm } from '@/shared/ui/TmdbTokenForm';

export const dynamic = 'force-dynamic';

const assurances = [
  {
    icon: IconRefresh,
    title: 'Validated live',
    body: 'Every token is checked against TMDB before it is stored.',
  },
  {
    icon: IconLock,
    title: 'Encrypted at rest',
    body: 'Tokens are sealed with AES-256-GCM and never kept in plain text.',
  },
  {
    icon: IconEyeOff,
    title: 'Never displayed',
    body: 'Once saved, the full token is never shown again — not even to you.',
  },
];

const SettingsTmdbPage = async () => {
  const status = await getTmdbTokenStatus();

  return (
    <article className="animate-fade-in mx-auto w-full max-w-xl space-y-6 font-sans">
      <div className="border-b border-white/8 pb-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="apple-badge border border-white/10 bg-white/6 text-zinc-300">
            <span>Settings</span>
          </div>
          <div
            className={`apple-badge border text-[11px] ${
              status.configured
                ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-300'
                : 'border-white/10 bg-white/6 text-zinc-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status.configured ? 'bg-emerald-400' : 'bg-zinc-500'
              }`}
            />
            {status.configured ? 'Token active' : 'No token'}
          </div>
        </div>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          <IconKey size={24} className="text-violet-400" />
          TMDB token
        </h2>
        <p className="mt-1 text-xs leading-relaxed font-normal text-zinc-400 md:text-sm">
          {status.configured
            ? 'Your catalogue requests use this token. Paste a new one below to rotate it.'
            : 'Connect your own TMDB read-access token to power search, trending, and artwork.'}
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-7">
        <TmdbTokenForm configured={status.configured} updatedAt={status.updatedAt} />
      </div>

      <div className="glass-card space-y-1 rounded-2xl p-2">
        {assurances.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-3 rounded-xl px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.04] text-violet-400">
                <Icon size={15} />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default SettingsTmdbPage;
