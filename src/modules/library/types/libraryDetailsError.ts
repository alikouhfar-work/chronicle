import type { ButtonHTMLAttributes } from 'react';

export type ErrorButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
};

export type ErrorMetaCardProps = {
  label: string;
  value: string;
  tone: string;
};

export type LibraryErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  onBack?: () => void;
  onNavigateTab?: (tab: 'dashboard' | 'library' | 'search') => void;
  title?: string;
};
