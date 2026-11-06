import Image from 'next/image';
import type { AuthShellProps } from '@/shared/types/authShell';

export const AuthShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
  width = 'sm',
}: AuthShellProps) => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 font-sans">
      <div className="ambient-glow pointer-events-none fixed top-0 left-1/2 z-0 h-96 w-full max-w-7xl -translate-x-1/2 opacity-60" />

      <div
        className={`animate-fade-in relative z-10 w-full ${width === 'md' ? 'max-w-md' : 'max-w-sm'}`}
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="group mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-control border border-line bg-surface-raised p-1 shadow-lg shadow-black/40">
            <Image width={44} height={44} alt="Chronicle Logo" src="/icons/logo.png" />
          </div>
          <div className="apple-badge mb-3 border border-accent-line bg-accent-bright/15 text-micro text-accent-ink">
            <span className="h-1.5 w-1.5 rounded-pill bg-accent-strong" />
            {eyebrow}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed font-normal text-ink-muted sm:text-sm">
            {description}
          </p>
        </div>

        <div className="glass-panel rounded-card p-6 sm:p-7">{children}</div>

        {footer && (
          <p className="mt-5 text-center text-xs leading-relaxed text-ink-subtle">{footer}</p>
        )}
      </div>
    </main>
  );
};
