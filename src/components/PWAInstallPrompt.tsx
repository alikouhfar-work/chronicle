'use client';

import { useEffect, useState } from 'react';
import {
  IconBolt,
  IconCheck,
  IconDownload,
  IconMaximize,
  IconSparkles,
  IconWifiOff,
  IconX,
} from '@tabler/icons-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import Image from 'next/image';

export const PWAInstallPrompt = () => {
  const { isInstalled, isDismissed, install, dismiss } = usePWAInstall();

  const [bannerReady, setBannerReady] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (isInstalled || isDismissed) return;
    const timer = setTimeout(() => setBannerReady(true), 2500);
    return () => clearTimeout(timer);
  }, [isInstalled, isDismissed]);

  // ⬇️ No `isInstallable` gate. Banner shows whenever eligible.
  const showBanner = bannerReady && !isInstalled && !isDismissed && !installSuccess;

  const handleInstall = async () => {
    const result = await install();

    if (result === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
      }, 2500);
    }
    // 'dismissed' → user closed the OS prompt; leave banner as-is.
    // 'manual'    → no native prompt available on this browser; nothing to do.
  };

  const handleDismiss = () => dismiss(3);

  if (isInstalled && !installSuccess) return null;

  return (
    <>
      {showBanner && (
        <div
          id="pwa-floating-banner"
          className="animate-in fade-in slide-in-from-bottom-4 fixed right-3 bottom-24 left-3 z-40 duration-400 sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-md"
        >
          <div className="glass-card group relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/90 p-3.5 shadow-2xl shadow-black/90 backdrop-blur-2xl sm:p-4">
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />

            <button
              id="pwa-banner-dismiss-btn"
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 cursor-pointer touch-manipulation rounded-full p-1.5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
              title="Dismiss for now"
              aria-label="Dismiss banner"
            >
              <IconX size={15} />
            </button>

            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 shrink-0">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-violet-500/30 bg-zinc-900 p-1 shadow-md shadow-violet-500/20 sm:h-11 sm:w-11">
                  <Image
                    width="40"
                    height="40"
                    alt="Chronicle Logo"
                    src="/icons/logo.png"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -right-1 -bottom-1 rounded-full bg-violet-500 p-0.5 text-white shadow-sm">
                  <IconSparkles size={9} />
                </div>
              </div>

              <div className="min-w-0 flex-1 pr-5">
                <h3 className="text-xs leading-tight font-bold tracking-tight text-white sm:text-sm">
                  Add Chronicle to Home Screen
                </h3>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-400 sm:text-xs">
                  Launch fullscreen with zero address bars, instant offline library access, and fast
                  loading.
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/25 bg-violet-500/15 px-2 py-0.5 text-[9px] font-medium text-violet-300 sm:text-[10px]">
                    <IconBolt size={9} />
                    Instant
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-medium text-emerald-300 sm:text-[10px]">
                    <IconWifiOff size={9} />
                    Offline
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/25 bg-sky-500/15 px-2 py-0.5 text-[9px] font-medium text-sky-300 sm:text-[10px]">
                    <IconMaximize size={9} />
                    Fullscreen
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-white/8 pt-2.5">
              <button
                id="pwa-banner-install-btn"
                onClick={handleInstall}
                className="flex min-h-[40px] flex-1 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:bg-violet-500 active:scale-[0.98]"
              >
                <IconDownload size={14} />
                <span>Install App</span>
              </button>

              <button
                id="pwa-banner-later-btn"
                onClick={handleDismiss}
                className="min-h-[40px] cursor-pointer touch-manipulation rounded-xl bg-white/6 px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.12] hover:text-white"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {installSuccess && (
        <div
          id="pwa-install-success-toast"
          className="animate-in fade-in slide-in-from-bottom-4 fixed right-3 bottom-24 left-3 z-40 duration-400 sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-md"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-950/95 p-4 shadow-2xl shadow-black/90 backdrop-blur-2xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
              <IconCheck size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm leading-tight font-bold text-white">Chronicle Installed!</h3>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                Launch it anytime from your home screen.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
