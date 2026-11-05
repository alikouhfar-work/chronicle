export type AppToastTone = 'success' | 'error' | 'info';

/** An inline action, e.g. "Undo" on a destructive confirmation. */
export type AppToastAction = {
  label: string;
  onClick: () => void;
};

export type AppToastProps = {
  id: string;
  tone: AppToastTone;
  title: string;
  message?: string;
  action?: AppToastAction;
};
