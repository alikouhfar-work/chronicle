import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { IconAt, IconLogout, IconUser } from '@tabler/icons-react';
import { auth } from '@/infra/auth/auth';
import { SignOutButton, UsernameForm } from '@/modules/user';
import { getProfileSummary } from '@/modules/user/services/getProfileSummary';
import { createMonogram } from '@/shared/lib/createMonogram';
import { BackButton } from '@/shared/ui/BackButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profile',
};

const ProfileSettingsPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect('/login?callbackUrl=/settings/profile');

  const user = await getProfileSummary(userId);

  if (!user) redirect('/login');

  const displayName = user.name?.trim() || user.username || 'Your account';
  const monogram = createMonogram(displayName);

  return (
    <article className="animate-fade-in mx-auto w-full max-w-2xl space-y-6 font-sans">
      <BackButton href="/" label="Back to dashboard" />

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
        <p className="text-sm text-zinc-400">
          Your handle is how other people mention you in public reviews.
        </p>
      </header>

      <section className="glass-card space-y-6 rounded-3xl border-white/10 p-6">
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="size-14 shrink-0 rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/15 text-lg font-bold text-violet-300"
            >
              {monogram || <IconUser size={20} />}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-white">{displayName}</p>
            <p className="truncate text-xs text-zinc-400">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <IconAt size={16} className="text-violet-400" />
            Public handle
          </div>
          <UsernameForm initialUsername={user.username} />
        </div>
      </section>

      <p className="text-xs text-zinc-500">
        Your email is never shown on public reviews, mentions, or notifications — only your display
        name, handle, and avatar.
      </p>

      <section className="glass-card space-y-4 rounded-3xl border-white/10 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <IconLogout size={16} className="text-red-400" />
          Session
        </div>
        <p className="text-xs text-zinc-400">
          Signing out ends the session on this device. Your library and reviews stay untouched.
        </p>
        <SignOutButton />
      </section>
    </article>
  );
};

export default ProfileSettingsPage;
