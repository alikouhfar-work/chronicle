import Image from 'next/image';
import type { ReactNode } from 'react';

export const AuthShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
  width = 'sm',
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md';
}) => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 font-sans">
      <div className="ambient-glow pointer-events-none fixed top-0 left-1/2 z-0 h-96 w-full max-w-7xl -translate-x-1/2 opacity-60" />

      <div
        className={`animate-fade-in relative z-10 w-full ${width === 'md' ? 'max-w-md' : 'max-w-sm'}`}
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="group mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-1 shadow-lg shadow-black/40">
            <Image width={44} height={44} alt="Chronicle Logo" src="/icons/logo.png" />
          </div>
          <div className="apple-badge mb-3 border border-violet-500/25 bg-violet-500/15 text-[11px] text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            {eyebrow}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed font-normal text-zinc-400 sm:text-sm">
            {description}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-7">{children}</div>

        {footer && (
          <p className="mt-5 text-center text-xs leading-relaxed text-zinc-600">{footer}</p>
        )}
      </div>
    </main>
  );
};
