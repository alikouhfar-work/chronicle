import Link from 'next/link';
import { IconChevronLeft } from '@tabler/icons-react';
import type { BackButtonProps } from '@/shared/types/backButton';

/**
 * The one back button in the app. Every page header renders this component
 * with an explicit `href`, so navigation is declarative, server-rendered, and
 * identical everywhere (no per-page `router.back()` variants).
 */
export const BackButton = ({ href, label }: BackButtonProps) => (
  <Link
    href={href}
    className="apple-pill-btn group inline-flex w-fit max-w-full cursor-pointer items-center gap-2 bg-surface-soft px-4 py-2 text-xs font-semibold text-ink-secondary transition-all hover:bg-surface-soft-hover"
  >
    <IconChevronLeft
      size={16}
      className="shrink-0 text-accent-ink transition-transform group-hover:-translate-x-0.5"
    />
    <span className="truncate">{label}</span>
  </Link>
);
