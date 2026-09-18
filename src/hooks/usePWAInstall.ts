'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type PlatformType = 'ios' | 'android' | 'desktop-chromium' | 'desktop-safari' | 'other';

const DISMISS_KEY = 'chronicle_pwa_dismissed_until';
const DEFAULT_DISMISS_DAYS = 3;

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia?.('(display-mode: standalone)').matches ?? false;

  const isIOSStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return isStandaloneMedia || isIOSStandalone;
}

function readDismissedUntil(): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return null;

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeDismissedUntil(expiry: number) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(DISMISS_KEY, String(expiry));
  } catch {
    // localStorage can throw in private mode or when blocked.
  }
}

function clearDismissedUntil() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(DISMISS_KEY);
  } catch {
    // ignore
  }
}

function detectPlatform(): PlatformType {
  if (typeof window === 'undefined') return 'other';

  const ua = window.navigator.userAgent.toLowerCase();

  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isIPadOS = /macintosh/.test(ua) && 'ontouchend' in document;
  const isAndroid = /android/.test(ua);

  const isMac = /macintosh|mac os x/.test(ua) && !isIOS && !isIPadOS;

  const isSafari = /safari/.test(ua) && !/chrome|crios|crmo|fxios|edg|edgi|opr|opera/.test(ua);

  if (isIOS || isIPadOS) return 'ios';
  if (isAndroid) return 'android';
  if (isSafari && isMac) return 'desktop-safari';
  if (/chrome|chromium|brave|edg|edge/.test(ua)) return 'desktop-chromium';

  return 'other';
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Lazy initializers avoid synchronous setState inside useEffect.
  const [isInstalled, setIsInstalled] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isStandalone() : false,
  );

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const until = readDismissedUntil();
    return !!until && Date.now() < until;
  });

  const platform = useMemo<PlatformType>(
    () => (typeof window !== 'undefined' ? detectPlatform() : 'other'),
    [],
  );

  useEffect(() => {
    // Clear expired dismissal if present (no setState needed).
    const until = readDismissedUntil();
    if (until && Date.now() >= until) {
      clearDismissedUntil();
    }

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(false);
      clearDismissedUntil();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DISMISS_KEY) return;

      if (!event.newValue) {
        setIsDismissed(false);
        return;
      }

      const expiry = Number.parseInt(event.newValue, 10);
      setIsDismissed(Number.isFinite(expiry) && Date.now() < expiry);
    };

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayModeChange = () => setIsInstalled(isStandalone());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('storage', handleStorage);
    mediaQuery?.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('storage', handleStorage);
      mediaQuery?.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (!deferredPrompt) return 'manual';

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      // The prompt event is single-use, even if the user dismisses it.
      setDeferredPrompt(null);

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsDismissed(false);
        clearDismissedUntil();
        return 'accepted';
      }

      return 'dismissed';
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      setDeferredPrompt(null);
      return 'manual';
    }
  }, [deferredPrompt]);

  const dismiss = useCallback((days = DEFAULT_DISMISS_DAYS) => {
    const safeDays = Number.isFinite(days) && days > 0 ? days : DEFAULT_DISMISS_DAYS;

    setIsDismissed(true);

    const expireAt = Date.now() + safeDays * 24 * 60 * 60 * 1000;
    writeDismissedUntil(expireAt);
  }, []);

  const resetDismissal = useCallback(() => {
    setIsDismissed(false);
    clearDismissedUntil();
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isDismissed,
    platform,
    install,
    dismiss,
    resetDismissal,
  };
}
