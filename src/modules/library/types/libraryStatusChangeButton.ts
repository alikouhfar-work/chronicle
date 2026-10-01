export type LibraryStatusChangeButtonProps = {
  entityId: string;
  entityLabel: 'Show' | 'Movie';
  currentStatus?: string;
  statusFilter: { key: string; title: string };
  disabled?: boolean;
  updateStatus: (id: string, status: string) => Promise<unknown>;
};
