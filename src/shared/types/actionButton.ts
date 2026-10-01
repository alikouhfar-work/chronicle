import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isPending?: boolean;
  pendingIcon?: ReactNode;
  icon?: ReactNode;
};
