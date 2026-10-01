import { IconLoader2 } from '@tabler/icons-react';
import { clsx } from 'clsx';
import type { ActionButtonProps } from '@/shared/types/actionButton';

export const ActionButton = ({
  isPending = false,
  pendingIcon,
  icon,
  children,
  disabled,
  className,
  ...rest
}: ActionButtonProps) => (
  <button
    aria-busy={isPending}
    disabled={disabled || isPending}
    className={clsx(className, isPending && 'cursor-wait opacity-80')}
    {...rest}
  >
    {isPending ? (pendingIcon ?? <IconLoader2 size={14} className="animate-spin" />) : icon}
    {children}
  </button>
);
