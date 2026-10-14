'use client';

import toast from 'react-hot-toast';
import { AppToast, type AppToastTone } from '@/shared/ui/AppToast';
import { getErrorMessage } from './errors';

const showAppToast = (tone: AppToastTone, title: string, message?: string): string =>
  toast.custom((t) => <AppToast id={t.id} tone={tone} title={title} message={message} />);

export const toastSuccess = (message: string, title = 'Done'): string =>
  showAppToast('success', title, message);

export const toastInfo = (message: string, title = 'Heads up'): string =>
  showAppToast('info', title, message);

export const toastError = (error: unknown, fallback = 'Something went wrong'): string =>
  showAppToast('error', 'Something went wrong', getErrorMessage(error, fallback));
