export type FailedActionResult = {
  success: false;
  error: string;
};

export type UseServerActionOptions = {
  successMessage?: string;
  errorMessage?: string;
  refresh?: boolean;
};
