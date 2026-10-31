'use client';

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
};

const getServerSnapshot = () => false;

/**
 * Tracks `prefers-reduced-motion` without a hydration mismatch: the server
 * snapshot always reports motion as allowed and the client corrects itself
 * after hydration.
 */
export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
