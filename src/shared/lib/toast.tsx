'use client';

import toast from 'react-hot-toast';
import { AppToast } from '@/shared/ui/AppToast';
import type { AppToastAction, AppToastTone } from '@/shared/types/appToast';
import { getErrorMessage } from './errors';

/**
 * A toast with an action lives long enough to be clicked — the unwatch undo
 * uses it — and dismisses itself first, so a second click cannot replay it.
 */
export const ACTION_TOAST_DURATION_MS = 10_000;

const showAppToast = (
  tone: AppToastTone,
  title: string,
  message?: string,
  action?: AppToastAction,
): string =>
  toast.custom(
    (t) => (
      <AppToast
        id={t.id}
        tone={tone}
        title={title}
        message={message}
        action={
          action
            ? {
                label: action.label,
                onClick: () => {
                  toast.dismiss(t.id);
                  action.onClick();
                },
              }
            : undefined
        }
      />
    ),
    action ? { duration: ACTION_TOAST_DURATION_MS } : undefined,
  );

export const toastSuccess = (message: string, title = 'Done', action?: AppToastAction): string =>
  showAppToast('success', title, message, action);

export const toastInfo = (message: string, title = 'Heads up', action?: AppToastAction): string =>
  showAppToast('info', title, message, action);

export const toastError = (error: unknown, fallback = 'Something went wrong'): string =>
  showAppToast('error', 'Something went wrong', getErrorMessage(error, fallback));
