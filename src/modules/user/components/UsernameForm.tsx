'use client';

import { useActionState, useState } from 'react';
import { IconAlertCircle, IconCheck, IconLoader2 } from '@tabler/icons-react';
import { updateUsername } from '@/modules/user/actions/updateUsername';
import type { UsernameState } from '@/modules/user/types';
import {
  isValidUsername,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@/modules/user/lib/username';

const initialState: UsernameState = { success: false };

type UsernameFormProps = {
  initialUsername: string | null;
};

export const UsernameForm = ({ initialUsername }: UsernameFormProps) => {
  const [value, setValue] = useState(initialUsername ?? '');
  const [state, formAction, isPending] = useActionState(updateUsername, initialState);

  const trimmed = value.trim();
  const isValid = isValidUsername(trimmed);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-zinc-300">
          Public handle
        </label>
        <div
          className={`flex items-center rounded-xl border bg-zinc-900/80 transition-colors focus-within:ring-2 ${
            state.error
              ? 'border-red-500/50 focus-within:border-red-400/60 focus-within:ring-red-500/20'
              : 'border-white/10 focus-within:border-violet-400/60 focus-within:ring-violet-500/20'
          }`}
        >
          <span aria-hidden className="pl-3.5 text-sm text-zinc-500">
            @
          </span>
          <input
            id="username"
            name="username"
            value={value}
            onChange={(event) => setValue(event.target.value.toLowerCase())}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={USERNAME_MAX_LENGTH}
            placeholder="your_handle"
            aria-invalid={state.error ? true : undefined}
            aria-describedby="username-hint"
            className="w-full bg-transparent px-2 py-2.5 pr-3.5 text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none sm:text-sm"
          />
        </div>
        <p id="username-hint" className="mt-1.5 text-xs text-zinc-500">
          {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters: lowercase letters, numbers, and
          underscores. People can mention you with @{trimmed || 'handle'}.
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          <IconAlertCircle size={15} className="mt-px shrink-0" />
          <span>{state.error}</span>
        </p>
      )}

      {state.success && (
        <p
          role="status"
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-400"
        >
          <IconCheck size={14} />
          Handle saved.
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || isPending}
        className="apple-pill-btn inline-flex items-center gap-2 bg-violet-500 px-5 py-2.5 text-sm text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <IconLoader2 size={16} className="animate-spin" />
        ) : (
          <IconCheck size={16} />
        )}
        {isPending ? 'Saving…' : 'Save handle'}
      </button>
    </form>
  );
};
