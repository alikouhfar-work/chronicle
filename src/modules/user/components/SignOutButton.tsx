'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { IconLoader2, IconLogout } from '@tabler/icons-react';

/** Client leaf: the app's only sign-out trigger, hosted on the profile page. */
export const SignOutButton = () => {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    void signOut({ redirectTo: '/login' });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="apple-pill-btn flex w-full cursor-pointer items-center justify-center gap-2 border border-danger/30 bg-danger-soft px-4 py-2.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-soft hover:text-ink-secondary disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {signingOut ? (
        <IconLoader2 size={14} className="animate-spin motion-reduce:animate-none" />
      ) : (
        <IconLogout size={14} />
      )}
      {signingOut ? 'Signing out…' : 'Sign out'}
    </button>
  );
};
