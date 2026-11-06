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
        <h1 className="text-2xl font-bold tracking-tight text-ink">Profile</h1>
        <p className="text-sm text-ink-muted">
          Your handle is how other people mention you in public reviews.
        </p>
      </header>

      <section className="glass-card space-y-6 rounded-card border-line p-6">
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="size-14 shrink-0 rounded-card border border-line object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-card border border-accent-line bg-accent-bright/15 text-lg font-bold text-accent-ink"
            >
              {monogram || <IconUser size={20} />}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">{displayName}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
            <IconAt size={16} className="text-accent-ink" />
            Public handle
          </div>
          <UsernameForm initialUsername={user.username} />
        </div>
      </section>

      <p className="text-xs text-ink-muted">
        Your email is never shown on public reviews, mentions, or notifications — only your display
        name, handle, and avatar.
      </p>

      <section className="glass-card space-y-4 rounded-card border-line p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <IconLogout size={16} className="text-danger" />
          Session
        </div>
        <p className="text-xs text-ink-muted">
          Signing out ends the session on this device. Your library and reviews stay untouched.
        </p>
        <SignOutButton />
      </section>
    </article>
  );
};

export default ProfileSettingsPage;
