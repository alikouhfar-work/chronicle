'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { toastError } from '@/shared/lib/toast';

type FailedActionResult = {
  success: false;
  error: string;
};

const isFailedResult = (value: unknown): value is FailedActionResult => {
  if (typeof value !== 'object' || value === null) return false;
  if (!('success' in value) || (value as { success: unknown }).success !== false) return false;
  return 'error' in value;
};

type UseServerActionOptions = {
  successMessage?: string;
  errorMessage?: string;
  refresh?: boolean;
};

export const useServerAction = <TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<unknown>,
  options?: UseServerActionOptions,
) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { successMessage, errorMessage, refresh = true } = options ?? {};

  const execute = useCallback(
    (...args: TArgs) => {
      startTransition(async () => {
        try {
          const result = await action(...args);

          if (isFailedResult(result)) {
            toastError(result.error, errorMessage);
            return;
          }

          if (successMessage) {
            toast.success(successMessage);
          }
          if (refresh) {
            router.refresh();
          }
        } catch (error) {
          toastError(error, errorMessage);
        }
      });
    },
    [action, errorMessage, refresh, router, successMessage],
  );

  return { execute, isPending };
};
