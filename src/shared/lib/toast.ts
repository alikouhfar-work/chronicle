'use client';

import toast from 'react-hot-toast';
import { getErrorMessage } from './errors';

export const toastError = (error: unknown, fallback = 'Something went wrong'): string =>
  toast.error(getErrorMessage(error, fallback));
