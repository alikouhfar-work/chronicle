import type { ReactNode } from 'react';

export type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md';
};
