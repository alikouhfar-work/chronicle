export type AppToastTone = 'success' | 'error' | 'info';

export type AppToastProps = {
  id: string;
  tone: AppToastTone;
  title: string;
  message?: string;
};
