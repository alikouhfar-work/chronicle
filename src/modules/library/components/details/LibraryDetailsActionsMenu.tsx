'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { IconDotsVertical } from '@tabler/icons-react';

type LibraryDetailsActionsMenuProps = {
  extraActions?: ReactNode;
  shareButton: ReactNode;
};

export const LibraryDetailsActionsMenu = ({
  extraActions,
  shareButton,
}: LibraryDetailsActionsMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
        className="apple-pill-btn cursor-pointer border border-white/10 bg-white/[0.04] p-2 text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      >
        <IconDotsVertical size={15} className="text-violet-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 flex min-w-52 flex-col gap-1.5 rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl shadow-black/60"
        >
          {extraActions}
          {shareButton}
        </div>
      )}
    </div>
  );
};
